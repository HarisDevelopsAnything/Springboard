package com.wellnest.dto.tracker;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class MealDto {
    private String id;
    private LocalDate date;
    private String mealType;
    private Integer calories;
    private Double protein;
    private Double carbs;
    private Double fats;
    private String items;
    private String notes;
}
