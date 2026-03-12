package com.wellnest.dto.notification;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class NotificationDto {
    private String id;
    private String userId;
    private String title;
    private String message;
    private String type;
    private Boolean isRead;
    private String relatedId;
    private LocalDateTime createdAt;
}
