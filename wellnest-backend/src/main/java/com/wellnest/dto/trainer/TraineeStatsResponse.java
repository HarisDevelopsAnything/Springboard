package com.wellnest.dto.trainer;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class TraineeStatsResponse {
    private String traineeId;
    private String traineeName;
    private String traineeEmail;
    
    // Today's stats
    private Double waterLiters;
    private Double waterGoalLiters;
    private Double totalCalories;
    private Double sleepHours;
    private Double sleepGoalHours;
    
    // Recent activity
    private Integer workoutsThisWeek;
    private Integer mealsLoggedToday;
}
