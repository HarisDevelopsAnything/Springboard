package com.wellnest.dto.ai;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AiChatMessage {
    private String role;
    private String content;
}
