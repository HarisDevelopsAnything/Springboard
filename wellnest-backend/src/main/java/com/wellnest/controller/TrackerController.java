package com.wellnest.controller;

import com.wellnest.dto.tracker.DailyStatRequest;
import com.wellnest.dto.tracker.MealRequest;
import com.wellnest.dto.tracker.WorkoutRequest;
import com.wellnest.entity.DailyStat;
import com.wellnest.entity.Meal;
import com.wellnest.entity.Workout;
import com.wellnest.service.TrackerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/tracker")
@RequiredArgsConstructor
public class TrackerController {

    private final TrackerService trackerService;

    // Workouts
    @PostMapping("/workouts")
    public ResponseEntity<?> createWorkout(@Valid @RequestBody WorkoutRequest req) {
        Workout saved = trackerService.createWorkout(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/workouts")
    public ResponseEntity<List<Workout>> listWorkouts(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(trackerService.listWorkouts(from, to));
    }

    @DeleteMapping("/workouts/{id}")
    public ResponseEntity<?> deleteWorkout(@PathVariable String id) {
        trackerService.deleteWorkout(id);
        return ResponseEntity.noContent().build();
    }

    // Meals
    @PostMapping("/meals")
    public ResponseEntity<?> createMeal(@Valid @RequestBody MealRequest req) {
        Meal saved = trackerService.createMeal(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/meals")
    public ResponseEntity<List<Meal>> listMeals(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return ResponseEntity.ok(trackerService.listMeals(from, to));
    }

    @DeleteMapping("/meals/{id}")
    public ResponseEntity<?> deleteMeal(@PathVariable String id) {
        trackerService.deleteMeal(id);
        return ResponseEntity.noContent().build();
    }

    // Daily stats
    @PostMapping("/daily-stats")
    public ResponseEntity<?> upsertDailyStat(@Valid @RequestBody DailyStatRequest req) {
        DailyStat saved = trackerService.upsertDailyStat(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/daily-stats")
    public ResponseEntity<List<DailyStat>> listDailyStats() {
        return ResponseEntity.ok(trackerService.listDailyStats());
    }
}

