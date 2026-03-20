package com.wellnest.service;

import com.wellnest.dto.*;
import com.wellnest.dto.trainer.*;
import com.wellnest.entity.*;
import com.wellnest.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrainerService {

    private static final int TRAINER_LOCK_DAYS = 30;

    private final UserRepository userRepository;
    private final FitnessProfileRepository fitnessProfileRepository;
    private final TrainerAssignmentRepository assignmentRepository;
    private final TrainerMessageRepository trainerMessageRepository;
    private final DailyStatRepository dailyStatRepository;
    private final MealRepository mealRepository;
    private final WorkoutRepository workoutRepository;

    /**
     * Get all available trainers with their active trainee count.
     */
    public List<TrainerDTO> getAvailableTrainers() {
        List<User> trainers = userRepository.findAllByRole(Role.ROLE_TRAINER);

        return trainers.stream()
                .filter(User::isEmailVerified)
                .map(trainer -> {
                int count = (int) assignmentRepository.findByTrainerIdAndActiveTrue(trainer.getId())
                    .stream()
                    .map(TrainerAssignment::getTraineeId)
                    .distinct()
                    .count();
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
     * Trainee selects a trainer.
     * Enforces: once selected, trainer cannot be changed for 30 days.
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

        // Get current active trainer assignment (latest by date)
        List<TrainerAssignment> activeAssignments = assignmentRepository.findByTraineeIdAndActiveTrue(traineeId);
        Optional<TrainerAssignment> currentOpt = activeAssignments.stream()
                .max(Comparator.comparing(TrainerAssignment::getDate));

        if (currentOpt.isPresent()) {
            TrainerAssignment current = currentOpt.get();
            LocalDate lockedUntil = current.getDate().plusDays(TRAINER_LOCK_DAYS);

            if (current.getTrainerId().equals(trainerId)) {
                return "You are already assigned to " + trainer.getFullName();
            }

            if (today.isBefore(lockedUntil)) {
                long daysRemaining = ChronoUnit.DAYS.between(today, lockedUntil);
                throw new RuntimeException(
                        "Trainer can only be changed after 30 days. " + daysRemaining + " day(s) remaining."
                );
            }

            // Lock period complete: deactivate existing active assignment(s) before changing
            activeAssignments.forEach(a -> a.setActive(false));
            assignmentRepository.saveAll(activeAssignments);
        }

        // Create new active assignment
        TrainerAssignment assignment = TrainerAssignment.builder()
                .traineeId(traineeId)
                .trainerId(trainerId)
                .date(today)
                .active(true)
                .build();
        assignmentRepository.save(assignment);

        log.info("Trainee {} selected trainer {} for {}", traineeId, trainerId, today);
        return "Successfully selected " + trainer.getFullName() + " as your trainer for the next 30 days";
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

        List<TrainerAssignment> assignments = assignmentRepository.findByTrainerIdAndActiveTrue(trainerId)
            .stream()
            .collect(Collectors.toMap(
                TrainerAssignment::getTraineeId,
                a -> a,
                (a, b) -> a.getDate().isAfter(b.getDate()) ? a : b
            ))
            .values()
            .stream()
            .collect(Collectors.toList());

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
         * Get the trainee's currently active trainer (if any).
         */
    public TrainerDTO getMyTrainerToday(String traineeId) {
        List<TrainerAssignment> activeAssignments = assignmentRepository.findByTraineeIdAndActiveTrue(traineeId);
        Optional<TrainerAssignment> assignment = activeAssignments.stream()
            .max(Comparator.comparing(TrainerAssignment::getDate));

        if (assignment.isEmpty()) {
            return null;
        }

        User trainer = userRepository.findById(assignment.get().getTrainerId())
                .orElse(null);
        if (trainer == null) return null;

        int count = (int) assignmentRepository.findByTrainerIdAndActiveTrue(trainer.getId())
            .stream()
            .map(TrainerAssignment::getTraineeId)
            .distinct()
            .count();
        return TrainerDTO.builder()
                .id(trainer.getId())
                .fullName(trainer.getFullName())
                .username(trainer.getUsername())
                .activeTraineeCount(count)
                .build();
    }

    /**
     * Get trainee's daily stats (water, calories, sleep, workouts) for trainer view
     */
    public TraineeStatsResponse getTraineeStats(String trainerId, String traineeId) {
        // Validate trainer has access to this trainee
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
        if (trainer.getRole() != Role.ROLE_TRAINER) {
            throw new RuntimeException("Access denied");
        }

        boolean assigned = assignmentRepository.existsByTraineeIdAndTrainerIdAndActiveTrue(traineeId, trainerId);

        if (!assigned) {
            throw new RuntimeException("You are not assigned to this trainee");
        }

        User trainee = userRepository.findById(traineeId)
                .orElseThrow(() -> new RuntimeException("Trainee not found"));

        // Get today's stats
        LocalDate today = LocalDate.now();
        Optional<DailyStat> todayStat = dailyStatRepository.findByUserIdAndDate(traineeId, today);

        // Get today's meals for calories
        List<Meal> todayMeals = mealRepository.findByUserIdAndDate(traineeId, today);
        double totalCalories = todayMeals.stream()
                .mapToDouble(m -> (m.getProtein() * 4) + (m.getCarbs() * 4) + (m.getFats() * 9))
                .sum();

        // Get this week's workouts
        LocalDate weekStart = today.minusDays(today.getDayOfWeek().getValue() - 1);
        List<Workout> weekWorkouts = workoutRepository.findAllByUserIdAndDateBetween(traineeId, weekStart, today);

        return TraineeStatsResponse.builder()
                .traineeId(traineeId)
                .traineeName(trainee.getFullName())
                .traineeEmail(trainee.getEmail())
                .waterLiters(todayStat.map(DailyStat::getWaterLiters).orElse(0.0))
                .waterGoalLiters(todayStat.map(DailyStat::getWaterGoalLiters).orElse(3.0))
                .totalCalories(totalCalories)
                .sleepHours(todayStat.map(DailyStat::getSleepHours).orElse(0.0))
                .sleepGoalHours(todayStat.map(DailyStat::getSleepGoalHours).orElse(8.0))
                .workoutsThisWeek(weekWorkouts.size())
                .mealsLoggedToday(todayMeals.size())
                .build();
    }

    /**
     * Send message from trainer to trainee
     */
    public TrainerMessage sendMessageToTrainee(String trainerId, SendMessageRequest request) {
        // Validate trainer
        User trainer = userRepository.findById(trainerId)
                .orElseThrow(() -> new RuntimeException("Trainer not found"));
        if (trainer.getRole() != Role.ROLE_TRAINER) {
            throw new RuntimeException("Access denied");
        }

        // Validate trainee assignment
        boolean assigned = assignmentRepository.existsByTraineeIdAndTrainerIdAndActiveTrue(
            request.getTraineeId(), trainerId);

        if (!assigned) {
            throw new RuntimeException("You are not assigned to this trainee");
        }

        TrainerMessage message = TrainerMessage.builder()
                .trainerId(trainerId)
                .traineeId(request.getTraineeId())
                .message(request.getMessage())
                .read(false)
                .build();

        return trainerMessageRepository.save(message);
    }

    /**
     * Get unread messages for trainee
     */
    public List<TrainerMessage> getUnreadMessages(String traineeId) {
        return trainerMessageRepository.findByTraineeIdAndReadFalseOrderByCreatedAtDesc(traineeId);
    }

    /**
     * Mark message as read
     */
    public void markMessageAsRead(String messageId, String traineeId) {
        TrainerMessage message = trainerMessageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        
        if (!message.getTraineeId().equals(traineeId)) {
            throw new RuntimeException("Access denied");
        }

        message.setRead(true);
        trainerMessageRepository.save(message);
    }
}

