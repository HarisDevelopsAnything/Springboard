package com.wellnest.service;

import com.wellnest.dto.tracker.WorkoutDto;
import com.wellnest.dto.tracker.WorkoutRequest;
import com.wellnest.entity.User;
import com.wellnest.entity.Workout;
import com.wellnest.repository.UserRepository;
import com.wellnest.repository.WorkoutRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkoutService {

    private final WorkoutRepository workoutRepository;

    public WorkoutDto createWorkout(String userId, WorkoutRequest req) {
        Workout w = Workout.builder()
                .userId(userId)
                .date(req.getDate())
                .exerciseType(req.getExerciseType())
                .durationMinutes(req.getDurationMinutes())
                .caloriesBurned(req.getCaloriesBurned())
                .notes(req.getNotes())
                .build();
        Workout saved = workoutRepository.save(w);
        return toDto(saved);
    }

    public List<WorkoutDto> listWorkouts(String userId) {
        return workoutRepository.findByUserIdOrderByDateDesc(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public WorkoutDto getWorkout(String userId, String id) {
        return workoutRepository.findById(id)
                .filter(w -> w.getUserId().equals(userId))
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Workout not found"));
    }

    public WorkoutDto updateWorkout(String userId, String id, WorkoutRequest req) {
        Workout w = workoutRepository.findById(id)
                .filter(x -> x.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Workout not found"));
        w.setDate(req.getDate());
        w.setExerciseType(req.getExerciseType());
        w.setDurationMinutes(req.getDurationMinutes());
        w.setCaloriesBurned(req.getCaloriesBurned());
        w.setNotes(req.getNotes());
        return toDto(workoutRepository.save(w));
    }

    public void deleteWorkout(String userId, String id) {
        Workout w = workoutRepository.findById(id)
                .filter(x -> x.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Workout not found"));
        workoutRepository.delete(w);
    }

    private WorkoutDto toDto(Workout w) {
        return WorkoutDto.builder()
                .id(w.getId())
                .date(w.getDate())
                .exerciseType(w.getExerciseType())
                .durationMinutes(w.getDurationMinutes())
                .caloriesBurned(w.getCaloriesBurned())
                .notes(w.getNotes())
                .build();
    }
}
