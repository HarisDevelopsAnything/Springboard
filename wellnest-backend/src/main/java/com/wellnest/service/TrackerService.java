package com.wellnest.service;

import com.wellnest.dto.tracker.DailyStatRequest;
import com.wellnest.dto.tracker.MealRequest;
import com.wellnest.dto.tracker.WorkoutRequest;
import com.wellnest.entity.*;
import com.wellnest.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
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
        String uid = currentUserId();
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
                    .notes(req.getNotes())
                    .build();
            return dailyStatRepository.save(ds);
        }
        DailyStat existing = existingOpt.get();
        existing.setWaterLiters(req.getWaterLiters());
        existing.setWaterGoalLiters(req.getWaterGoalLiters());
        existing.setSleepHours(req.getSleepHours());
        existing.setSleepGoalHours(req.getSleepGoalHours());
        existing.setRemSleepHours(req.getRemSleepHours());
        existing.setDeepSleepHours(req.getDeepSleepHours());
        existing.setLightSleepHours(req.getLightSleepHours());
        existing.setNotes(req.getNotes());
        return dailyStatRepository.save(existing);
    }

    public List<DailyStat> listDailyStats() {
        return dailyStatRepository.findAllByUserId(currentUserId());
    }
}
