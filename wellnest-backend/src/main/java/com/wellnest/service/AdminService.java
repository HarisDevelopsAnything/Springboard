package com.wellnest.service;

import com.wellnest.dto.AdminDashboardStats;
import com.wellnest.dto.UserListDTO;
import com.wellnest.entity.Role;
import com.wellnest.entity.ReportStatus;
import com.wellnest.entity.User;
import com.wellnest.repository.ReportRepository;
import com.wellnest.repository.TrainerAssignmentRepository;
import com.wellnest.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminService {

    private final UserRepository userRepository;
    private final ReportRepository reportRepository;
    private final TrainerAssignmentRepository assignmentRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Initialize default admin account on startup.
     */
    @PostConstruct
    public void initializeAdminAccount() {
        // Check if admin already exists
        if (!userRepository.existsByUsername("wellnest_admin")) {
            User admin = User.builder()
                    .username("wellnest_admin")
                    .email("admin@wellnest.com")
                    .password(passwordEncoder.encode("WellNest@2026"))
                    .fullName("System Administrator")
                    .role(Role.ROLE_ADMIN)
                    .emailVerified(true)
                    .build();
            userRepository.save(admin);
            log.info("Default admin account created: username=wellnest_admin, password=WellNest@2026");
        }
    }

    /**
     * Get dashboard statistics for admin.
     */
    public AdminDashboardStats getDashboardStats() {
        long totalUsers = userRepository.findAllByRole(Role.ROLE_USER).size();
        long totalTrainers = userRepository.findAllByRole(Role.ROLE_TRAINER).size();
        long pendingReports = reportRepository.countByStatus(ReportStatus.PENDING);
        long totalReports = reportRepository.count();
        long activeAssignments = assignmentRepository.findAll().stream()
                .filter(assignment -> assignment.isActive())
                .count();

        return AdminDashboardStats.builder()
                .totalUsers(totalUsers)
                .totalTrainers(totalTrainers)
                .pendingReports(pendingReports)
                .totalReports(totalReports)
                .activeAssignments(activeAssignments)
                .build();
    }

    /**
     * Get all customers (users with ROLE_USER).
     */
    public List<UserListDTO> getAllCustomers() {
        return userRepository.findAllByRole(Role.ROLE_USER).stream()
                .map(this::mapToUserListDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get all trainers (users with ROLE_TRAINER).
     */
    public List<UserListDTO> getAllTrainers() {
        return userRepository.findAllByRole(Role.ROLE_TRAINER).stream()
                .map(user -> {
                    UserListDTO dto = mapToUserListDTO(user);
                    int assignedClients = assignmentRepository.findByTrainerIdAndActiveTrue(user.getId()).size();
                    dto.setAssignedClients(assignedClients);
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Delete a user by ID (customer or trainer).
     */
    public void deleteUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        if (user.getRole() == Role.ROLE_ADMIN) {
            throw new RuntimeException("Cannot delete admin users");
        }
        
        // Delete associated assignments if trainer
        if (user.getRole() == Role.ROLE_TRAINER) {
            List<com.wellnest.entity.TrainerAssignment> assignments = 
                    assignmentRepository.findByTrainerId(userId);
            assignmentRepository.deleteAll(assignments);
        }
        
        userRepository.delete(user);
        log.info("User deleted: {} ({})", user.getUsername(), user.getEmail());
    }

    /**
     * Helper method to map User entity to UserListDTO.
     */
    private UserListDTO mapToUserListDTO(User user) {
        return UserListDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .emailVerified(user.isEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
