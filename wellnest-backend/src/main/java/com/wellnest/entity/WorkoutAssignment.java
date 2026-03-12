package com.wellnest.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "workout_assignments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WorkoutAssignment {
    @Id
    private String id;

    private String traineeId;

    private String traineeName;

    private String trainerId;

    private String trainerName;

    private String workoutPlan; // JSON string or structured workout plan

    private String nutritionPlan; // JSON string or structured nutrition plan

    private String bmiCategory; // Based on which BMI category this was assigned

    private String notes; // Trainer's notes

    private Boolean isActive;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
