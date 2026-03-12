package com.wellnest.dto.bmi;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class BmiCalculationResponse {
    private Double bmi;
    private String category; // UNDERWEIGHT, NORMAL, OVERWEIGHT, OBESE
    private String workoutRecommendation;
    private String nutritionRecommendation;
    private Double idealWeightMin;
    private Double idealWeightMax;
}
