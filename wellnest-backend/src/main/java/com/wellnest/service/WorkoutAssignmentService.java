package com.wellnest.service;

import com.wellnest.dto.bmi.BmiCalculationResponse;
import com.wellnest.dto.workout.WorkoutAssignmentDto;
import com.wellnest.dto.workout.WorkoutAssignmentRequest;
import com.wellnest.entity.FitnessProfile;
import com.wellnest.entity.User;
import com.wellnest.entity.WorkoutAssignment;
import com.wellnest.repository.FitnessProfileRepository;
import com.wellnest.repository.UserRepository;
import com.wellnest.repository.WorkoutAssignmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutAssignmentService {
    private final WorkoutAssignmentRepository workoutAssignmentRepository;
    private final UserRepository userRepository;
    private final FitnessProfileRepository fitnessProfileRepository;
    private final NotificationService notificationService;
    private final BmiService bmiService;

    public WorkoutAssignmentDto assignWorkout(String trainerId, WorkoutAssignmentRequest request) {
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
        User trainee = userRepository.findById(request.getTraineeId())
                .orElseThrow(() -> new RuntimeException("Trainee not found"));

        // Get trainee's BMI category
        String bmiCategory = "NORMAL";
        try {
            FitnessProfile profile = fitnessProfileRepository.findByUserId(request.getTraineeId()).orElse(null);
            if (profile != null && profile.getWeight() != null && profile.getHeight() != null) {
                BmiCalculationResponse bmiCalc = bmiService.calculateBmi(profile.getWeight(), profile.getHeight());
                bmiCategory = bmiCalc.getCategory();
            }
        } catch (Exception e) {
            // If BMI calculation fails, use default
        }

        // Deactivate previous assignments
        List<WorkoutAssignment> previousAssignments = workoutAssignmentRepository
                .findByTraineeIdAndIsActiveTrueOrderByCreatedAtDesc(request.getTraineeId());
        previousAssignments.forEach(assignment -> {
            assignment.setIsActive(false);
            workoutAssignmentRepository.save(assignment);
        });

        // Create new assignment
        WorkoutAssignment assignment = WorkoutAssignment.builder()
                .traineeId(request.getTraineeId())
                .traineeName(trainee.getFullName())
                .trainerId(trainerId)
                .trainerName(trainer.getFullName())
                .workoutPlan(request.getWorkoutPlan())
                .nutritionPlan(request.getNutritionPlan())
                .bmiCategory(bmiCategory)
                .notes(request.getNotes())
                .isActive(true)
                .build();

        assignment = workoutAssignmentRepository.save(assignment);

        // Create notification for trainee
        String notificationTitle = previousAssignments.isEmpty() 
                ? "New Workout Plan Assigned!" 
                : "Your Workout Plan Has Been Updated!";
        String notificationMessage = String.format(
                "Your trainer %s has assigned you a new workout and nutrition plan. Check it out now!",
                trainer.getFullName()
        );
        notificationService.createNotification(
                request.getTraineeId(),
                notificationTitle,
                notificationMessage,
                "WORKOUT_ASSIGNED",
                assignment.getId()
        );

        return mapToDto(assignment);
    }

    public WorkoutAssignmentDto updateWorkout(String trainerId, String assignmentId, WorkoutAssignmentRequest request) {
        WorkoutAssignment assignment = workoutAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Workout assignment not found"));

        if (!assignment.getTrainerId().equals(trainerId)) {
            throw new RuntimeException("Unauthorized");
        }

        assignment.setWorkoutPlan(request.getWorkoutPlan());
        assignment.setNutritionPlan(request.getNutritionPlan());
        assignment.setNotes(request.getNotes());

        assignment = workoutAssignmentRepository.save(assignment);

        // Create notification for trainee
        notificationService.createNotification(
                assignment.getTraineeId(),
                "Workout Plan Updated!",
                String.format(
                        "Your trainer %s has updated your workout and nutrition plan. Review the changes now!",
                        assignment.getTrainerName()
                ),
                "WORKOUT_UPDATED",
                assignment.getId()
        );

        return mapToDto(assignment);
    }

    public WorkoutAssignmentDto getActiveAssignment(String traineeId) {
        WorkoutAssignment assignment = workoutAssignmentRepository
                .findByTraineeIdAndIsActiveTrue(traineeId)
                .orElse(null);
        
        return assignment != null ? mapToDto(assignment) : null;
    }

    public List<WorkoutAssignmentDto> getTraineeAssignments(String traineeId) {
        List<WorkoutAssignment> assignments = workoutAssignmentRepository
                .findByTraineeIdOrderByCreatedAtDesc(traineeId);
        return assignments.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<WorkoutAssignmentDto> getTrainerAssignments(String trainerId) {
        List<WorkoutAssignment> assignments = workoutAssignmentRepository
                .findByTrainerIdOrderByCreatedAtDesc(trainerId);
        return assignments.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private WorkoutAssignmentDto mapToDto(WorkoutAssignment entity) {
        return WorkoutAssignmentDto.builder()
                .id(entity.getId())
                .traineeId(entity.getTraineeId())
                .traineeName(entity.getTraineeName())
                .trainerId(entity.getTrainerId())
                .trainerName(entity.getTrainerName())
                .workoutPlan(entity.getWorkoutPlan())
                .nutritionPlan(entity.getNutritionPlan())
                .bmiCategory(entity.getBmiCategory())
                .notes(entity.getNotes())
                .isActive(entity.getIsActive())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
