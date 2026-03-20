package com.wellnest.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

@Document(collection = "chat_messages")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessage {
    @Id
    private String id;

    private String senderId;

    private String senderName;

    private String receiverId;

    private String receiverName;

    @Indexed
    private String conversationId;

    private String message;

    private Boolean isRead;

    @Builder.Default
    private Boolean deletedForEveryone = false;

    @Builder.Default
    private List<String> deletedForUsers = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;
}
