package com.wellnest.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Request body for when a trainee selects a trainer.
 */
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class SelectTrainerRequest {

    @NotBlank(message = "Trainer ID is required")
    private String trainerId;
}
