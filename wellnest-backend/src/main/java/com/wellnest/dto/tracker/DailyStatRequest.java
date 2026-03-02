package com.wellnest.dto.tracker;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class DailyStatRequest {
    @NotNull
    private LocalDate date;

    @Min(0)
    private Double waterLiters;

    @Min(2)
    private Double waterGoalLiters;

    @Min(0)
    private Double sleepHours;

    @Min(0)
    private Double sleepGoalHours;

    @Min(0)
    private Double remSleepHours;

    @Min(0)
    private Double deepSleepHours;

    @Min(0)
    private Double lightSleepHours;

    private String notes;
}

