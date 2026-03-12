package com.wellnest.dto.chat;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ChatMessageRequest {
    private String receiverId;
    private String message;
}
