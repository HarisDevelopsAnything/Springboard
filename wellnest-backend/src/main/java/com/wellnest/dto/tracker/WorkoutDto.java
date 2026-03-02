package com.wellnest.dto.tracker;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class WorkoutDto {
    private String id;
    private LocalDate date;
    private String exerciseType;
    private Integer durationMinutes;
    private Integer caloriesBurned;
    private String notes;
}
