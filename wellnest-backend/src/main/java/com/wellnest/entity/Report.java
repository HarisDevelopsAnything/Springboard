package com.wellnest.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Report document representing customer reports against trainers.
 */
@Document(collection = "reports")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Report {

    @Id
    private String id;

    private String customerId;
    
    private String customerName;
    
    private String customerEmail;

    private String trainerId;
    
    private String trainerName;
    
    private String trainerEmail;

    private String message;

    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    @CreatedDate
    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;
    
    private String resolvedBy; // Admin ID who resolved
}
