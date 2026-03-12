package com.wellnest.service;

import com.wellnest.dto.chat.ChatMessageDto;
import com.wellnest.dto.chat.ChatMessageRequest;
import com.wellnest.entity.ChatMessage;
import com.wellnest.entity.User;
import com.wellnest.repository.ChatMessageRepository;
import com.wellnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;

    public ChatMessageDto sendMessage(String senderId, ChatMessageRequest request) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findById(request.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        ChatMessage message = ChatMessage.builder()
                .senderId(senderId)
                .senderName(sender.getFullName())
                .receiverId(request.getReceiverId())
                .receiverName(receiver.getFullName())
                .message(request.getMessage())
                .isRead(false)
                .build();

        message = chatMessageRepository.save(message);
        return mapToDto(message);
    }

    public List<ChatMessageDto> getConversation(String userId, String otherUserId) {
        List<ChatMessage> messages = chatMessageRepository
                .findBySenderIdAndReceiverIdOrReceiverIdAndSenderIdOrderByCreatedAtAsc(
                        userId, otherUserId, otherUserId, userId);
        
        // Mark messages as read if current user is receiver
        messages.stream()
                .filter(msg -> msg.getReceiverId().equals(userId) && !msg.getIsRead())
                .forEach(msg -> {
                    msg.setIsRead(true);
                    chatMessageRepository.save(msg);
                });

        return messages.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<ChatMessageDto> getUnreadMessages(String userId) {
        List<ChatMessage> messages = chatMessageRepository.findByReceiverIdAndIsReadFalse(userId);
        return messages.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public Long getUnreadCount(String userId) {
        return chatMessageRepository.countByReceiverIdAndIsReadFalse(userId);
    }

    public void markAsRead(String messageId, String userId) {
        ChatMessage message = chatMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        if (!message.getReceiverId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        message.setIsRead(true);
        chatMessageRepository.save(message);
    }

    private ChatMessageDto mapToDto(ChatMessage entity) {
        return ChatMessageDto.builder()
                .id(entity.getId())
                .senderId(entity.getSenderId())
                .senderName(entity.getSenderName())
                .receiverId(entity.getReceiverId())
                .receiverName(entity.getReceiverName())
                .message(entity.getMessage())
                .isRead(entity.getIsRead())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
