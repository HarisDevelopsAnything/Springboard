package com.wellnest.dto.tracker;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.AssertTrue;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class DailyStatRequest {
    @NotNull
    @JsonAlias({"day", "statDate"})
    private LocalDate date;

    @Email
    @JsonAlias({"userEmail", "mail"})
    private String email;

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

    @Min(0)
    @JsonAlias({"stepCount", "stepsCount", "dailySteps", "step"})
    private Integer steps;

    private String notes;

    @AssertTrue(message = "At least one daily stat field is required")
    public boolean hasAnyDailyStatField() {
        return waterLiters != null
                || waterGoalLiters != null
                || sleepHours != null
                || sleepGoalHours != null
                || remSleepHours != null
                || deepSleepHours != null
                || lightSleepHours != null
                || steps != null
                || (notes != null && !notes.isBlank());
    }
}

