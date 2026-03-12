package com.wellnest.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "weight_history")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class WeightHistory {
    @Id
    private String id;

    private String userId;

    private LocalDate date;

    private Double weight; // in kilograms

    private Double bmi; // calculated BMI

    private String bmiCategory; // UNDERWEIGHT, NORMAL, OVERWEIGHT, OBESE

    private String notes;

    @CreatedDate
    private LocalDateTime createdAt;
}
