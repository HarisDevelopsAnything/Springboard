package com.wellnest.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "trainer_messages")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TrainerMessage {
    @Id
    private String id;

    private String trainerId;

    private String traineeId;

    private String message;

    private Boolean read;

    @CreatedDate
    private LocalDateTime createdAt;
}
