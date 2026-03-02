package com.wellnest.controller;

import com.wellnest.dto.*;
import com.wellnest.dto.trainer.*;
import com.wellnest.entity.TrainerMessage;
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

    /**
     * GET /api/trainers/trainee-stats/{traineeId}
     * Trainer gets specific trainee's daily stats (water, calories, sleep, workouts)
     */
    @GetMapping("/trainee-stats/{traineeId}")
    public ResponseEntity<ApiResponse> getTraineeStats(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String traineeId) {
        try {
            TraineeStatsResponse stats = trainerService.getTraineeStats(userDetails.getId(), traineeId);
            return ResponseEntity.ok(ApiResponse.success("Trainee stats retrieved", stats));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * POST /api/trainers/send-message
     * Trainer sends a message to trainee
     */
    @PostMapping("/send-message")
    public ResponseEntity<ApiResponse> sendMessage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody SendMessageRequest request) {
        try {
            TrainerMessage message = trainerService.sendMessageToTrainee(userDetails.getId(), request);
            return ResponseEntity.ok(ApiResponse.success("Message sent successfully", message));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    /**
     * GET /api/trainers/messages/unread
     * Trainee gets unread messages from their trainer
     */
    @GetMapping("/messages/unread")
    public ResponseEntity<ApiResponse> getUnreadMessages(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<TrainerMessage> messages = trainerService.getUnreadMessages(userDetails.getId());
        return ResponseEntity.ok(ApiResponse.success("Unread messages retrieved", messages));
    }

    /**
     * PUT /api/trainers/messages/{messageId}/read
     * Trainee marks a message as read
     */
    @PutMapping("/messages/{messageId}/read")
    public ResponseEntity<ApiResponse> markMessageAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String messageId) {
        try {
            trainerService.markMessageAsRead(messageId, userDetails.getId());
            return ResponseEntity.ok(ApiResponse.success("Message marked as read"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

