package com.wellnest.dto;

import lombok.*;

/**
 * DTO representing a trainee card on the trainer's dashboard.
 * Contains trainee user info + fitness profile summary.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TraineeCardDTO {
    private String id;
    private String username;
    private String fullName;
    private String email;
    private String assignmentDate;

    // Fitness profile data
    private Integer age;
    private Double weight;
    private Double height;
    private String gender;
    private String fitnessGoal;
    private String activityLevel;
    private String medicalNotes;

    /** Whether this trainee has completed their fitness profile */
    private boolean hasProfile;
}
