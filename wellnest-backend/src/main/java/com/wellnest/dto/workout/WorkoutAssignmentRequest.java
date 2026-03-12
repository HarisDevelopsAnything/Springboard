package com.wellnest.dto.workout;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WorkoutAssignmentRequest {
    private String traineeId;
    private String workoutPlan;
    private String nutritionPlan;
    private String notes;
}
