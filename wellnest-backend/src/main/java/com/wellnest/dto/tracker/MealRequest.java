package com.wellnest.dto.tracker;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class MealRequest {
    @NotNull
    private LocalDate date;

    @NotBlank
    private String mealType;

    @Min(0)
    private Integer calories;

    private Double protein;

    private Double carbs;

    private Double fats;

    private String items;

    private String notes;
}

