package com.wellnest.controller;

import com.wellnest.dto.ApiResponse;
import com.wellnest.dto.CreateReportRequest;
import com.wellnest.dto.ReportDTO;
import com.wellnest.entity.ReportStatus;
import com.wellnest.security.CustomUserDetails;
import com.wellnest.service.ReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    /**
     * POST /api/reports
     * Create a report against a trainer (customer only).
     */
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse> createReport(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody CreateReportRequest request) {
        try {
            ReportDTO report = reportService.createReport(userDetails.getId(), request);
            return ResponseEntity.ok(ApiResponse.success("Report submitted successfully", report));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /api/reports/my-reports
     * Get reports submitted by current customer.
     */
    @GetMapping("/my-reports")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<ApiResponse> getMyReports(@AuthenticationPrincipal CustomUserDetails userDetails) {
        List<ReportDTO> reports = reportService.getReportsByCustomer(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Your reports retrieved", reports));
    }

    /**
     * GET /api/reports
     * Get all reports (admin only).
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getAllReports() {
        List<ReportDTO> reports = reportService.getAllReports();
        return ResponseEntity.ok(ApiResponse.success("All reports retrieved", reports));
    }

    /**
     * GET /api/reports/pending
     * Get pending reports (admin only).
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getPendingReports() {
        List<ReportDTO> reports = reportService.getPendingReports();
        return ResponseEntity.ok(ApiResponse.success("Pending reports retrieved", reports));
    }

    /**
     * PATCH /api/reports/{reportId}/status
     * Update report status (admin only).
     */
    @PatchMapping("/{reportId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> updateReportStatus(
            @PathVariable String reportId,
            @RequestParam ReportStatus status,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            ReportDTO report = reportService.updateReportStatus(reportId, status, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Report status updated", report));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * DELETE /api/reports/{reportId}
     * Delete a report (admin only).
     */
    @DeleteMapping("/{reportId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> deleteReport(@PathVariable String reportId) {
        try {
            reportService.deleteReport(reportId);
            return ResponseEntity.ok(ApiResponse.success("Report deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /api/reports/trainer/{trainerId}
     * Get all reports against a specific trainer (admin only).
     */
    @GetMapping("/trainer/{trainerId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse> getReportsByTrainer(@PathVariable String trainerId) {
        List<ReportDTO> reports = reportService.getReportsByTrainer(trainerId);
        return ResponseEntity.ok(ApiResponse.success("Trainer reports retrieved", reports));
    }
}
