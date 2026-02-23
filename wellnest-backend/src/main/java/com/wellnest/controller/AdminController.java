package com.wellnest.controller;

import com.wellnest.dto.AdminDashboardStats;
import com.wellnest.dto.ApiResponse;
import com.wellnest.dto.UserListDTO;
import com.wellnest.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    /**
     * GET /api/admin/stats
     * Get dashboard statistics.
     */
    @GetMapping("/stats")
    public ResponseEntity<ApiResponse> getDashboardStats() {
        AdminDashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats retrieved", stats));
    }

    /**
     * GET /api/admin/customers
     * Get all customers.
     */
    @GetMapping("/customers")
    public ResponseEntity<ApiResponse> getAllCustomers() {
        List<UserListDTO> customers = adminService.getAllCustomers();
        return ResponseEntity.ok(ApiResponse.success("Customers retrieved", customers));
    }

    /**
     * GET /api/admin/trainers
     * Get all trainers.
     */
    @GetMapping("/trainers")
    public ResponseEntity<ApiResponse> getAllTrainers() {
        List<UserListDTO> trainers = adminService.getAllTrainers();
        return ResponseEntity.ok(ApiResponse.success("Trainers retrieved", trainers));
    }

    /**
     * DELETE /api/admin/users/{userId}
     * Delete a user (customer or trainer).
     */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable String userId) {
        try {
            adminService.deleteUser(userId);
            return ResponseEntity.ok(ApiResponse.success("User deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
