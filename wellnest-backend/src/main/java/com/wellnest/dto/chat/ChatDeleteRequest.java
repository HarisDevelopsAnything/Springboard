package com.wellnest.dto.chat;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatDeleteRequest {
    private String messageId;
}
