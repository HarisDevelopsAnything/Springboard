package com.wellnest.service;

import com.wellnest.dto.tracker.DailyStatRequest;
import com.wellnest.dto.tracker.MealRequest;
import com.wellnest.dto.tracker.WorkoutRequest;
import com.wellnest.entity.*;
import com.wellnest.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrackerService {

    private final WorkoutRepository workoutRepository;
    private final MealRepository mealRepository;
    private final DailyStatRepository dailyStatRepository;
    private final UserRepository userRepository;

    private String currentUserId() {
        String principal = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsernameOrEmail(principal, principal)
                .orElseThrow(() -> new RuntimeException("Authenticated user not found"))
                .getId();
    }

    private String resolveUserIdForDailyStats(DailyStatRequest req) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String principal = auth.getName();
            if (principal != null && !principal.isBlank() && !"anonymousUser".equals(principal)) {
                java.util.Optional<User> authUser = userRepository.findByUsernameOrEmail(principal, principal);
                if (authUser.isPresent()) {
                    String email = req.getEmail();
                    if (email != null && !email.isBlank()) {
                        User emailUser = userRepository.findByEmail(email.trim())
                                .orElseThrow(() -> new RuntimeException("No user found for provided email"));
                        if (!emailUser.getId().equals(authUser.get().getId())) {
                            throw new RuntimeException("Provided email does not match authenticated user");
                        }
                    }
                    return authUser.get().getId();
                }
            }
        }

        String email = req.getEmail();
        if (email != null && !email.isBlank()) {
            return userRepository.findByEmail(email.trim())
                    .orElseThrow(() -> new RuntimeException("No user found for provided email"))
                    .getId();
        }

        throw new RuntimeException("Unable to resolve user for daily stats");
    }

    // Workouts
    public Workout createWorkout(WorkoutRequest req) {
        Workout w = Workout.builder()
                .userId(currentUserId())
                .date(req.getDate())
                .exerciseType(req.getExerciseType())
                .durationMinutes(req.getDurationMinutes())
                .caloriesBurned(req.getCaloriesBurned())
                .notes(req.getNotes())
                .build();
        return workoutRepository.save(w);
    }

    public List<Workout> listWorkouts(LocalDate from, LocalDate to) {
        String uid = currentUserId();
        if (from != null && to != null) return workoutRepository.findAllByUserIdAndDateBetween(uid, from, to);
        return workoutRepository.findAllByUserId(uid);
    }

    public void deleteWorkout(String id) {
        workoutRepository.deleteById(id);
    }

    // Meals
    public Meal createMeal(MealRequest req) {
        Meal m = Meal.builder()
                .userId(currentUserId())
                .date(req.getDate())
                .mealType(req.getMealType())
                .calories(req.getCalories())
                .protein(req.getProtein())
                .carbs(req.getCarbs())
                .fats(req.getFats())
                .items(req.getItems())
                .notes(req.getNotes())
                .build();
        return mealRepository.save(m);
    }

    public List<Meal> listMeals(LocalDate from, LocalDate to) {
        String uid = currentUserId();
        if (from != null && to != null) return mealRepository.findAllByUserIdAndDateBetween(uid, from, to);
        return mealRepository.findAllByUserId(uid);
    }

    public void deleteMeal(String id) {
        mealRepository.deleteById(id);
    }

    // Daily stats
    public DailyStat upsertDailyStat(DailyStatRequest req) {
        String uid = resolveUserIdForDailyStats(req);
        log.info("Upsert daily stats request userId={}, date={}, steps={}, emailPresent={}",
                uid, req.getDate(), req.getSteps(), req.getEmail() != null && !req.getEmail().isBlank());
        java.util.Optional<DailyStat> existingOpt = dailyStatRepository.findByUserIdAndDate(uid, req.getDate());
        if (existingOpt.isEmpty()) {
            DailyStat ds = DailyStat.builder()
                    .userId(uid)
                    .date(req.getDate())
                    .waterLiters(req.getWaterLiters())
                    .waterGoalLiters(req.getWaterGoalLiters())
                    .sleepHours(req.getSleepHours())
                    .sleepGoalHours(req.getSleepGoalHours())
                    .remSleepHours(req.getRemSleepHours())
                    .deepSleepHours(req.getDeepSleepHours())
                    .lightSleepHours(req.getLightSleepHours())
                    .steps(req.getSteps())
                    .notes(req.getNotes())
                    .build();
            return dailyStatRepository.save(ds);
        }
        DailyStat existing = existingOpt.get();
        if (req.getWaterLiters() != null) existing.setWaterLiters(req.getWaterLiters());
        if (req.getWaterGoalLiters() != null) existing.setWaterGoalLiters(req.getWaterGoalLiters());
        if (req.getSleepHours() != null) existing.setSleepHours(req.getSleepHours());
        if (req.getSleepGoalHours() != null) existing.setSleepGoalHours(req.getSleepGoalHours());
        if (req.getRemSleepHours() != null) existing.setRemSleepHours(req.getRemSleepHours());
        if (req.getDeepSleepHours() != null) existing.setDeepSleepHours(req.getDeepSleepHours());
        if (req.getLightSleepHours() != null) existing.setLightSleepHours(req.getLightSleepHours());
        if (req.getSteps() != null) existing.setSteps(req.getSteps());
        if (req.getNotes() != null) existing.setNotes(req.getNotes());
        return dailyStatRepository.save(existing);
    }

    public List<DailyStat> listDailyStats() {
        return dailyStatRepository.findAllByUserId(currentUserId());
    }
}
