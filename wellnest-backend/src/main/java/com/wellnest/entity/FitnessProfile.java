package com.wellnest.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * FitnessProfile document storing user health & fitness details.
 */
@Document(collection = "fitness_profiles")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class FitnessProfile {

    @Id
    private String id;

    @Indexed(unique = true)
    private String userId;

    private Integer age;

    /** Weight in kilograms */
    private Double weight;

    /** Height in centimeters */
    private Double height;

    private String gender;

    /**
     * Fitness goal: WEIGHT_LOSS, MUSCLE_GAIN, GENERAL_HEALTH, ENDURANCE, FLEXIBILITY
     */
    private String fitnessGoal;

    /** Activity level: SEDENTARY, LIGHTLY_ACTIVE, MODERATELY_ACTIVE, VERY_ACTIVE */
    private String activityLevel;

    /** Any medical conditions or allergies */
    private String medicalNotes;
}
