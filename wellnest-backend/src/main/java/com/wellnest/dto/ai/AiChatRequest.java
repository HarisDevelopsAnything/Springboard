package com.wellnest.dto.ai;

import lombok.*;

import java.util.List;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AiChatRequest {
    private String message;
    private List<AiChatMessage> history;
}
