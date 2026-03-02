package com.wellnest.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "workouts")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Workout {
    @Id
    private String id;

    private String userId;

    private LocalDate date;

    private String exerciseType; // cardio, strength, yoga, etc.

    private Integer durationMinutes;

    private Integer caloriesBurned;

    private String notes;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
