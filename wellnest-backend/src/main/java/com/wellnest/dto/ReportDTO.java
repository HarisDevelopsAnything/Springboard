package com.wellnest.dto;

import com.wellnest.entity.ReportStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for returning report information.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    
    private String id;
    private String customerId;
    private String customerName;
    private String customerEmail;
    private String trainerId;
    private String trainerName;
    private String trainerEmail;
    private String message;
    private ReportStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
    private String resolvedBy;
}
