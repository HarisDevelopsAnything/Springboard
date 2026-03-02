package com.wellnest.dto.trainer;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class SendMessageRequest {
    private String traineeId;
    private String message;
}
