package com.wellnest.service;

import com.wellnest.dto.chat.ChatMessageDto;
import com.wellnest.dto.chat.ChatMessageRequest;
import com.wellnest.dto.chat.ChatContactDto;
import com.wellnest.entity.ChatMessage;
import com.wellnest.entity.Role;
import com.wellnest.entity.TrainerAssignment;
import com.wellnest.entity.User;
import com.wellnest.repository.ChatMessageRepository;
import com.wellnest.repository.TrainerAssignmentRepository;
import com.wellnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final TrainerAssignmentRepository trainerAssignmentRepository;
    private final AesEncryptionService aesEncryptionService;

    public ChatMessageDto sendMessage(String senderId, ChatMessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        validateChatPermission(sender, receiver);

        ChatMessage message = ChatMessage.builder()
                .senderId(senderId)
                .senderName(sender.getFullName())
                .receiverId(request.getReceiverId())
                .receiverName(receiver.getFullName())
                .message(aesEncryptionService.encrypt(request.getMessage()))
                .isRead(false)
                .build();

        message = chatMessageRepository.save(message);
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
        messages.stream()
                .filter(msg -> msg.getReceiverId().equals(userId) && !msg.getIsRead())
                .forEach(msg -> {
                    msg.setIsRead(true);
                    chatMessageRepository.save(msg);
                });

        return messages.stream().map(this::mapToDto).collect(Collectors.toList());
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

        if (user.getRole() == Role.ROLE_TRAINER) {
            List<String> traineeIds = trainerAssignmentRepository.findByTrainerIdAndActiveTrue(userId).stream()
                .map(TrainerAssignment::getTraineeId)
                .distinct()
                .filter(traineeId -> getCurrentAssignmentForTrainee(traineeId)
                        .map(a -> a.getTrainerId().equals(userId))
                        .orElse(false))
                .collect(Collectors.toList());

            return userRepository.findAllById(traineeIds).stream()
                    .map(u -> ChatContactDto.builder()
                            .id(u.getId())
                            .fullName(u.getFullName())
                            .username(u.getUsername())
                            .role(u.getRole().name())
                            .build())
                    .collect(Collectors.toList());
        } else {
            Optional<TrainerAssignment> current = getCurrentAssignmentForTrainee(userId);
            if (current.isEmpty()) {
                return List.of();
            }

            return userRepository.findById(current.get().getTrainerId())
                    .map(u -> List.of(ChatContactDto.builder()
                            .id(u.getId())
                            .fullName(u.getFullName())
                            .username(u.getUsername())
                            .role(u.getRole().name())
                            .build()))
                    .orElse(List.of());
        }
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
