package com.wellnest.dto.weight;

import lombok.*;

import java.time.LocalDate;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WeightEntryRequest {
    private LocalDate date;
    private Double weight; // in kilograms
    private String notes;
}
