package com.wellnest.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;

/**
 * DTO for creating a report against a trainer.
 */
@Data
public class CreateReportRequest {
    
    @NotBlank(message = "Trainer ID is required")
    private String trainerId;
    
    @NotBlank(message = "Message is required")
    private String message;
}
