package com.wellnest.dto.workout;

import lombok.*;

import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WorkoutAssignmentDto {
    private String id;
    private String traineeId;
    private String traineeName;
    private String trainerId;
    private String trainerName;
    private String workoutPlan;
    private String nutritionPlan;
    private String bmiCategory;
    private String notes;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
