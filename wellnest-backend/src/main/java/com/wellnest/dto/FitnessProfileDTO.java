package com.wellnest.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FitnessProfileDTO {
    private String id;
    private Integer age;
    private Double weight;
    private Double height;
    private String gender;
    private String fitnessGoal;
    private String activityLevel;
    private String medicalNotes;
}
