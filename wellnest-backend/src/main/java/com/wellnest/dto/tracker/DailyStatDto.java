package com.wellnest.dto.tracker;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class DailyStatDto {
    private String id;
    private LocalDate date;
    private Double waterLiters;
    private Double sleepHours;
    private Integer steps;
    private String notes;
}
