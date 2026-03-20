package com.wellnest.service;

import com.wellnest.dto.chat.ChatMessageDto;
import com.wellnest.dto.chat.ChatMessageRequest;
import com.wellnest.dto.chat.ChatContactDto;
import com.wellnest.entity.ChatMessage;
import com.wellnest.entity.Role;
import com.wellnest.entity.TrainerAssignment;
import com.wellnest.entity.UserChatMetadata;
import com.wellnest.entity.User;
import com.wellnest.repository.ChatMessageRepository;
import com.wellnest.repository.TrainerAssignmentRepository;
import com.wellnest.repository.UserChatMetadataRepository;
import com.wellnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final TrainerAssignmentRepository trainerAssignmentRepository;
    private final UserChatMetadataRepository userChatMetadataRepository;
    private final AesEncryptionService aesEncryptionService;

    public ChatMessageDto sendMessage(String senderId, ChatMessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        validateChatPermission(sender, receiver);

        String conversationId = getConversationId(senderId, request.getReceiverId());

        ChatMessage message = ChatMessage.builder()
                .senderId(senderId)
                .senderName(sender.getFullName())
                .receiverId(request.getReceiverId())
                .receiverName(receiver.getFullName())
            .conversationId(conversationId)
                .message(aesEncryptionService.encrypt(request.getMessage()))
                .isRead(false)
                .build();

        message = chatMessageRepository.save(message);
        upsertReadMetadata(senderId, conversationId, message.getId(), message.getCreatedAt());
        return mapToDto(message);
    }

    public String getConversationId(String userA, String userB) {
        return userA.compareTo(userB) < 0 ? userA + "_" + userB : userB + "_" + userA;
    }

    public List<ChatMessageDto> getConversation(String userId, String otherUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("Other user not found"));

        validateChatPermission(user, otherUser);

        List<ChatMessage> messages = chatMessageRepository
                .findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByCreatedAtAsc(
                        userId, otherUserId, otherUserId, userId);

        messages = messages.stream()
            .filter(msg -> msg.getDeletedForUsers() == null || !msg.getDeletedForUsers().contains(userId))
            .collect(Collectors.toList());
        
        // Mark messages as read if current user is receiver
        List<ChatMessage> toMarkRead = messages.stream()
                .filter(msg -> msg.getReceiverId().equals(userId) && !msg.getIsRead())
                .peek(msg -> msg.setIsRead(true))
                .collect(Collectors.toList());

        if (!toMarkRead.isEmpty()) {
            chatMessageRepository.saveAll(toMarkRead);
        }

        markConversationAsRead(userId, otherUserId, messages);

        return messages.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public void markConversationAsRead(String userId, String otherUserId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User otherUser = userRepository.findById(otherUserId)
                .orElseThrow(() -> new RuntimeException("Other user not found"));

        validateChatPermission(user, otherUser);

        List<ChatMessage> messages = chatMessageRepository
                .findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByCreatedAtAsc(
                        userId, otherUserId, otherUserId, userId);

        markConversationAsRead(userId, otherUserId, messages);
    }

    public void deleteMessageForMe(String messageId, String userId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSenderId().equals(userId) && !message.getReceiverId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        if (message.getDeletedForUsers() == null) {
            message.setDeletedForUsers(new ArrayList<>());
            message.getDeletedForUsers().add(userId);
        } else if (!message.getDeletedForUsers().contains(userId)) {
            message.getDeletedForUsers().add(userId);
        }

        chatMessageRepository.save(message);
    }

    public ChatMessageDto deleteMessageForEveryone(String messageId, String userId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        if (!message.getSenderId().equals(userId)) {
            throw new RuntimeException("Only sender can delete for everyone");
        }

        message.setDeletedForEveryone(true);
        message.setMessage(aesEncryptionService.encrypt("This message was deleted"));
        chatMessageRepository.save(message);

        return mapToDto(message);
    }

    public List<ChatContactDto> getAllowedChatContacts(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<User> allowedContacts = getAllowedContactUsers(user);
        return allowedContacts.stream()
                .map(u -> buildContactDto(userId, u))
                .collect(Collectors.toList());
    }

    public Long getUnreadCount(String userId) {
        return getUnreadCount(userId, true);
    }

    public Long getUnreadCount(String userId, boolean keepArchivedChats) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<User> allowedContacts = getAllowedContactUsers(user);
        long unreadChats = 0L;

        for (User contact : allowedContacts) {
            String chatId = getConversationId(userId, contact.getId());
            UserChatMetadata metadata = userChatMetadataRepository.findByUserIdAndChatId(userId, chatId).orElse(null);

            if (!keepArchivedChats && metadata != null && Boolean.TRUE.equals(metadata.getArchived())) {
                continue;
            }

            ChatMessage latestVisibleMessage = getLatestVisibleMessageForUser(userId, contact.getId());
            if (isChatUnreadForUser(userId, latestVisibleMessage, metadata)) {
                unreadChats++;
            }
        }

        return unreadChats;
    }

    private List<User> getAllowedContactUsers(User user) {
        String userId = user.getId();

        if (user.getRole() == Role.ROLE_TRAINER) {
            List<String> traineeIds = trainerAssignmentRepository.findByTrainerIdAndActiveTrue(userId).stream()
                .map(TrainerAssignment::getTraineeId)
                .distinct()
                .filter(traineeId -> getCurrentAssignmentForTrainee(traineeId)
                        .map(a -> a.getTrainerId().equals(userId))
                        .orElse(false))
                .collect(Collectors.toList());

            return userRepository.findAllById(traineeIds).stream().collect(Collectors.toList());
        } else {
            Optional<TrainerAssignment> current = getCurrentAssignmentForTrainee(userId);
            if (current.isEmpty()) {
                return List.of();
            }

            return userRepository.findById(current.get().getTrainerId())
                    .map(List::of)
                    .orElse(List.of());
        }
    }

    private ChatContactDto buildContactDto(String userId, User contact) {
        String chatId = getConversationId(userId, contact.getId());
        UserChatMetadata metadata = userChatMetadataRepository.findByUserIdAndChatId(userId, chatId).orElse(null);
        ChatMessage latestVisibleMessage = getLatestVisibleMessageForUser(userId, contact.getId());

        boolean unread = isChatUnreadForUser(userId, latestVisibleMessage, metadata);

        return ChatContactDto.builder()
                .id(contact.getId())
                .fullName(contact.getFullName())
                .username(contact.getUsername())
                .role(contact.getRole().name())
                .unread(unread)
                .unreadCount(unread ? 1L : 0L)
                .muted(metadata != null && Boolean.TRUE.equals(metadata.getMuted()))
                .archived(metadata != null && Boolean.TRUE.equals(metadata.getArchived()))
                .build();
    }

    private ChatMessage getLatestVisibleMessageForUser(String userId, String otherUserId) {
        Optional<ChatMessage> latest = chatMessageRepository
                .findTopBySenderIdAndReceiverIdOrSenderIdAndReceiverIdOrderByCreatedAtDesc(
                        userId, otherUserId, otherUserId, userId);

        if (latest.isEmpty()) {
            return null;
        }

        ChatMessage message = latest.get();
        if (Boolean.TRUE.equals(message.getDeletedForEveryone())) {
            return null;
        }

        if (message.getDeletedForUsers() != null && message.getDeletedForUsers().contains(userId)) {
            return null;
        }

        return message;
    }

    private boolean isChatUnreadForUser(String userId, ChatMessage latestMessage, UserChatMetadata metadata) {
        if (latestMessage == null || latestMessage.getCreatedAt() == null) {
            return false;
        }

        if (userId.equals(latestMessage.getSenderId())) {
            return false;
        }

        LocalDateTime lastReadAt = metadata != null && metadata.getLastReadAt() != null
                ? metadata.getLastReadAt()
                : LocalDateTime.MIN;

        return latestMessage.getCreatedAt().isAfter(lastReadAt);
    }

    private void markConversationAsRead(String userId, String otherUserId, List<ChatMessage> messages) {
        String chatId = getConversationId(userId, otherUserId);
        ChatMessage latestVisible = null;

        for (int i = messages.size() - 1; i >= 0; i--) {
            ChatMessage candidate = messages.get(i);
            if (isVisibleForReceiver(candidate, userId)) {
                latestVisible = candidate;
                break;
            }
        }

        if (latestVisible == null) {
            return;
        }

        upsertReadMetadata(userId, chatId, latestVisible.getId(), latestVisible.getCreatedAt());
    }

    private void upsertReadMetadata(String userId, String chatId, String lastReadMessageId, LocalDateTime lastReadAt) {
        UserChatMetadata metadata = userChatMetadataRepository.findByUserIdAndChatId(userId, chatId)
                .orElse(UserChatMetadata.builder()
                        .userId(userId)
                        .chatId(chatId)
                        .muted(false)
                        .archived(false)
                        .build());

        metadata.setLastReadMessageId(lastReadMessageId);
        metadata.setLastReadAt(lastReadAt != null ? lastReadAt : LocalDateTime.now());
        metadata.setUpdatedAt(LocalDateTime.now());
        userChatMetadataRepository.save(metadata);
    }

    private boolean isVisibleForReceiver(ChatMessage msg, String receiverId) {
        if (Boolean.TRUE.equals(msg.getDeletedForEveryone())) {
            return false;
        }

        return msg.getDeletedForUsers() == null || !msg.getDeletedForUsers().contains(receiverId);
    }

    private ChatMessageDto mapToDto(ChatMessage entity) {
        String messageText = entity.getDeletedForEveryone() != null && entity.getDeletedForEveryone()
            ? "This message was deleted"
            : aesEncryptionService.decrypt(entity.getMessage());

        return ChatMessageDto.builder()
                .id(entity.getId())
                .senderId(entity.getSenderId())
                .senderName(entity.getSenderName())
                .receiverId(entity.getReceiverId())
                .receiverName(entity.getReceiverName())
            .message(messageText)
                .isRead(entity.getIsRead())
            .deletedForEveryone(entity.getDeletedForEveryone())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    private void validateChatPermission(User sender, User receiver) {
        if (sender.getRole() == receiver.getRole()) {
            throw new RuntimeException("Chat is allowed only between trainer and trainee");
        }

        String traineeId = sender.getRole() == Role.ROLE_TRAINER ? receiver.getId() : sender.getId();
        String trainerId = sender.getRole() == Role.ROLE_TRAINER ? sender.getId() : receiver.getId();

        Optional<TrainerAssignment> current = getCurrentAssignmentForTrainee(traineeId);
        if (current.isEmpty() || !current.get().getTrainerId().equals(trainerId)) {
            throw new RuntimeException("Chat is allowed only with your assigned trainer/trainee");
        }
    }

    private Optional<TrainerAssignment> getCurrentAssignmentForTrainee(String traineeId) {
        return trainerAssignmentRepository.findByTraineeIdAndActiveTrue(traineeId).stream()
                .max(Comparator.comparing(TrainerAssignment::getDate));
    }
}
