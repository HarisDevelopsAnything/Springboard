package com.wellnest.dto.tracker;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WorkoutRequest {
    @NotNull
    private LocalDate date;

    @NotBlank
    private String exerciseType;

    @Min(0)
    private Integer durationMinutes;

    private Integer caloriesBurned;

    private String notes;
}

