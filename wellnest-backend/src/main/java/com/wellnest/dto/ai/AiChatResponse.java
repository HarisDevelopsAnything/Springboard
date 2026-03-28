package com.wellnest.dto.ai;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AiChatResponse {
    private String reply;
    private String model;
}
