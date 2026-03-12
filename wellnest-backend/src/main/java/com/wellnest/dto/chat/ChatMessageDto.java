package com.wellnest.dto.chat;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessageDto {
    private String id;
    private String senderId;
    private String senderName;
    private String receiverId;
    private String receiverName;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
}
