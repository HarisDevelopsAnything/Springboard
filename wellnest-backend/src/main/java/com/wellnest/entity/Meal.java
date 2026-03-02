package com.wellnest.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "meals")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Meal {
    @Id
    private String id;

    private String userId;

    private LocalDate date;

    private String mealType; // breakfast, lunch, dinner, snack

    private Integer calories;

    private Double protein;

    private Double carbs;

    private Double fats;

    private String items;

    private String notes;

    @CreatedDate
    private LocalDateTime createdAt;


    @LastModifiedDate
    private LocalDateTime updatedAt;
}
