package com.wellnest.dto.weight;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WeightHistoryDto {
    private String id;
    private String userId;
    private LocalDate date;
    private Double weight;
    private Double bmi;
    private String bmiCategory;
    private String notes;
    private LocalDateTime createdAt;
}
