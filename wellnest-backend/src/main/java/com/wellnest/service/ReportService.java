package com.wellnest.service;

import com.wellnest.dto.CreateReportRequest;
import com.wellnest.dto.ReportDTO;
import com.wellnest.entity.Report;
import com.wellnest.entity.ReportStatus;
import com.wellnest.entity.User;
import com.wellnest.repository.ReportRepository;
import com.wellnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;

    /**
     * Create a report from customer against a trainer.
     */
    public ReportDTO createReport(String customerId, CreateReportRequest request) {
        // Get customer details
        User customer = userRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        // Get trainer details
        User trainer = userRepository.findById(request.getTrainerId())
                .orElseThrow(() -> new RuntimeException("Trainer not found"));

        if (trainer.getRole() != com.wellnest.entity.Role.ROLE_TRAINER) {
            throw new RuntimeException("Reported user is not a trainer");
        }

        Report report = Report.builder()
                .customerId(customerId)
                .customerName(customer.getFullName())
                .customerEmail(customer.getEmail())
                .trainerId(request.getTrainerId())
                .trainerName(trainer.getFullName())
                .trainerEmail(trainer.getEmail())
                .message(request.getMessage())
                .status(ReportStatus.PENDING)
                .build();

        report = reportRepository.save(report);
        log.info("Report created: Customer {} reported trainer {}", customer.getUsername(), trainer.getUsername());

        return mapToReportDTO(report);
    }

    /**
     * Get all reports (for admin).
     */
    public List<ReportDTO> getAllReports() {
        return reportRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::mapToReportDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get pending reports (for admin).
     */
    public List<ReportDTO> getPendingReports() {
        return reportRepository.findAllByStatus(ReportStatus.PENDING).stream()
                .map(this::mapToReportDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get reports by customer ID.
     */
    public List<ReportDTO> getReportsByCustomer(String customerId) {
        return reportRepository.findAllByCustomerId(customerId).stream()
                .map(this::mapToReportDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get reports against a specific trainer.
     */
    public List<ReportDTO> getReportsByTrainer(String trainerId) {
        return reportRepository.findAllByTrainerId(trainerId).stream()
                .map(this::mapToReportDTO)
                .collect(Collectors.toList());
    }

    /**
     * Update report status (admin action).
     */
    public ReportDTO updateReportStatus(String reportId, ReportStatus status, String adminId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));

        report.setStatus(status);
        if (status == ReportStatus.RESOLVED || status == ReportStatus.DISMISSED) {
            report.setResolvedAt(LocalDateTime.now());
            report.setResolvedBy(adminId);
        }

        report = reportRepository.save(report);
        log.info("Report {} status updated to {} by admin {}", reportId, status, adminId);

        return mapToReportDTO(report);
    }

    /**
     * Delete a report (admin action).
     */
    public void deleteReport(String reportId) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        
        reportRepository.delete(report);
        log.info("Report deleted: {}", reportId);
    }

    /**
     * Helper method to map Report entity to ReportDTO.
     */
    private ReportDTO mapToReportDTO(Report report) {
        return ReportDTO.builder()
                .id(report.getId())
                .customerId(report.getCustomerId())
                .customerName(report.getCustomerName())
                .customerEmail(report.getCustomerEmail())
                .trainerId(report.getTrainerId())
                .trainerName(report.getTrainerName())
                .trainerEmail(report.getTrainerEmail())
                .message(report.getMessage())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .resolvedAt(report.getResolvedAt())
                .resolvedBy(report.getResolvedBy())
                .build();
    }
}
