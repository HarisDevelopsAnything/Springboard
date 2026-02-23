package com.wellnest.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for admin dashboard statistics.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardStats {
    
    private long totalUsers;
    private long totalTrainers;
    private long pendingReports;
    private long totalReports;
    private long activeAssignments;
}
