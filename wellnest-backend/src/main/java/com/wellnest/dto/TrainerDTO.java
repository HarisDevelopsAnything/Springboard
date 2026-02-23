package com.wellnest.dto;

import lombok.*;

/**
 * DTO for listing available trainers for trainees to select from.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TrainerDTO {
    private String id;
    private String fullName;
    private String username;
    /** How many active trainees this trainer currently has */
    private int activeTraineeCount;
}
