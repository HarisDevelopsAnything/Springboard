package com.wellnest.service;

import com.wellnest.dto.*;
import com.wellnest.entity.*;
import com.wellnest.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrainerService {

    private final UserRepository userRepository;
    private final FitnessProfileRepository fitnessProfileRepository;
    private final TrainerAssignmentRepository assignmentRepository;

    /**
     * Get all available trainers with their active trainee count.
     */
    public List<TrainerDTO> getAvailableTrainers() {
        List<User> trainers = userRepository.findAllByRole(Role.ROLE_TRAINER);

        return trainers.stream()
                .filter(User::isEmailVerified)
                .map(trainer -> {
                    int count = assignmentRepository.findByTrainerIdAndActiveTrue(trainer.getId()).size();
                    return TrainerDTO.builder()
                            .id(trainer.getId())
                            .fullName(trainer.getFullName())
                            .username(trainer.getUsername())
                            .activeTraineeCount(count)
                            .build();
                })
                .collect(Collectors.toList());
    }

    /**
     * Trainee selects a trainer for today.
     * Enforces: one trainer per trainee per day.
     */
    public String selectTrainer(String traineeId, String trainerId) {
        // Validate the trainee is not a trainer themselves
        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (trainee.getRole() == Role.ROLE_TRAINER) {
            throw new RuntimeException("Trainers cannot select a trainer for themselves");
        }

        // Validate the trainer exists and has the TRAINER role
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
        if (trainer.getRole() != Role.ROLE_TRAINER) {
            throw new RuntimeException("Selected user is not a trainer");
        }

        LocalDate today = LocalDate.now();

        // Check if trainee already picked a trainer today
        Optional<TrainerAssignment> existing = assignmentRepository.findByTraineeIdAndDate(traineeId, today);
        if (existing.isPresent()) {
            TrainerAssignment assignment = existing.get();
            if (assignment.getTrainerId().equals(trainerId)) {
                throw new RuntimeException("You have already selected this trainer for today");
            }
            // Update to the new trainer
            assignment.setTrainerId(trainerId);
            assignment.setActive(true);
            assignmentRepository.save(assignment);
            return "Trainer changed to " + trainer.getFullName() + " for today";
        }

        // Create new assignment
        TrainerAssignment assignment = TrainerAssignment.builder()
                .traineeId(traineeId)
                .trainerId(trainerId)
                .date(today)
                .active(true)
                .build();
        assignmentRepository.save(assignment);

        log.info("Trainee {} selected trainer {} for {}", traineeId, trainerId, today);
        return "Successfully selected " + trainer.getFullName() + " as your trainer for today";
    }

    /**
     * Get the trainer's trainees — for the trainer dashboard.
     * Returns active trainees with their fitness profile data.
     */
    public List<TraineeCardDTO> getMyTrainees(String trainerId) {
        // Validate the user is a trainer
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (trainer.getRole() != Role.ROLE_TRAINER) {
            throw new RuntimeException("Access denied. You are not a trainer.");
        }

        List<TrainerAssignment> assignments = assignmentRepository.findByTrainerIdAndActiveTrue(trainerId);

        return assignments.stream()
                .map(assignment -> {
                    Optional<User> traineeOpt = userRepository.findById(assignment.getTraineeId());
                    if (traineeOpt.isEmpty()) return null;

                    User trainee = traineeOpt.get();
                    Optional<FitnessProfile> profileOpt = fitnessProfileRepository.findByUserId(trainee.getId());

                    TraineeCardDTO.TraineeCardDTOBuilder card = TraineeCardDTO.builder()
                            .id(trainee.getId())
                            .username(trainee.getUsername())
                            .fullName(trainee.getFullName())
                            .email(trainee.getEmail())
                            .assignmentDate(assignment.getDate().toString());

                    if (profileOpt.isPresent()) {
                        FitnessProfile fp = profileOpt.get();
                        card.hasProfile(true)
                                .age(fp.getAge())
                                .weight(fp.getWeight())
                                .height(fp.getHeight())
                                .gender(fp.getGender())
                                .fitnessGoal(fp.getFitnessGoal())
                                .activityLevel(fp.getActivityLevel())
                                .medicalNotes(fp.getMedicalNotes());
                    } else {
                        card.hasProfile(false);
                    }

                    return card.build();
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    /**
     * Get the trainee's current trainer for today (if any).
     */
    public TrainerDTO getMyTrainerToday(String traineeId) {
        LocalDate today = LocalDate.now();
        Optional<TrainerAssignment> assignment = assignmentRepository.findByTraineeIdAndDate(traineeId, today);

        if (assignment.isEmpty()) {
            return null;
        }

        User trainer = userRepository.findById(assignment.get().getTrainerId())
                .orElse(null);
        if (trainer == null) return null;

        int count = assignmentRepository.findByTrainerIdAndActiveTrue(trainer.getId()).size();
        return TrainerDTO.builder()
                .id(trainer.getId())
                .fullName(trainer.getFullName())
                .username(trainer.getUsername())
                .activeTraineeCount(count)
                .build();
    }
}
