package com.wellnest.controller;

import com.wellnest.dto.workout.WorkoutAssignmentDto;
import com.wellnest.dto.workout.WorkoutAssignmentRequest;
import com.wellnest.service.WorkoutAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/workout-assignments")
@RequiredArgsConstructor
public class WorkoutAssignmentController {
    private final WorkoutAssignmentService workoutAssignmentService;

    @PostMapping("/assign")
    public ResponseEntity<Map<String, Object>> assignWorkout(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody WorkoutAssignmentRequest request) {
        try {
            String trainerId = userDetails.getUsername();
            WorkoutAssignmentDto assignment = workoutAssignmentService.assignWorkout(trainerId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", assignment);
            response.put("message", "Workout assigned successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{assignmentId}")
    public ResponseEntity<Map<String, Object>> updateWorkout(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String assignmentId,
            @RequestBody WorkoutAssignmentRequest request) {
        try {
            String trainerId = userDetails.getUsername();
            WorkoutAssignmentDto assignment = workoutAssignmentService.updateWorkout(trainerId, assignmentId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", assignment);
            response.put("message", "Workout updated successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/my-assignment")
    public ResponseEntity<Map<String, Object>> getMyActiveAssignment(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String userId = userDetails.getUsername();
            WorkoutAssignmentDto assignment = workoutAssignmentService.getActiveAssignment(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", assignment);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/my-history")
    public ResponseEntity<Map<String, Object>> getMyAssignments(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String userId = userDetails.getUsername();
            List<WorkoutAssignmentDto> assignments = workoutAssignmentService.getTraineeAssignments(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", assignments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/trainer/all")
    public ResponseEntity<Map<String, Object>> getTrainerAssignments(
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            String trainerId = userDetails.getUsername();
            List<WorkoutAssignmentDto> assignments = workoutAssignmentService.getTrainerAssignments(trainerId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", assignments);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
