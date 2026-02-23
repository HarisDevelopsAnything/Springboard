package com.wellnest.controller;

import com.wellnest.dto.*;
import com.wellnest.security.CustomUserDetails;
import com.wellnest.service.TrainerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trainers")
@RequiredArgsConstructor
public class TrainerController {

    private final TrainerService trainerService;

    /**
     * GET /api/trainers
     * List all available trainers. Any authenticated user can call this.
     */
    @GetMapping
    public ResponseEntity<ApiResponse> getAvailableTrainers() {
        List<TrainerDTO> trainers = trainerService.getAvailableTrainers();
        return ResponseEntity.ok(ApiResponse.success("Available trainers retrieved", trainers));
    }

    /**
     * POST /api/trainers/select
     * Trainee selects a trainer for today.
     */
    @PostMapping("/select")
    public ResponseEntity<ApiResponse> selectTrainer(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody SelectTrainerRequest request) {
        try {
            String message = trainerService.selectTrainer(userDetails.getId(), request.getTrainerId());
            return ResponseEntity.ok(ApiResponse.success(message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /api/trainers/my-trainees
     * Trainer gets all their active trainees with fitness data.
     */
    @GetMapping("/my-trainees")
    public ResponseEntity<ApiResponse> getMyTrainees(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            List<TraineeCardDTO> trainees = trainerService.getMyTrainees(userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Trainees retrieved", trainees));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /api/trainers/my-trainer-today
     * Trainee checks who their trainer is for today.
     */
    @GetMapping("/my-trainer-today")
    public ResponseEntity<ApiResponse> getMyTrainerToday(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        TrainerDTO trainer = trainerService.getMyTrainerToday(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Current trainer retrieved", trainer));
    }
}
