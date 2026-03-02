package com.wellnest.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Document(collection = "daily_stats")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class DailyStat {
    @Id
    private String id;

    private String userId;

    private LocalDate date;

    private Double waterLiters; // liters consumed

    private Double waterGoalLiters; // daily water goal (2-6 liters)

    private Double sleepHours; // hours slept

    private Double sleepGoalHours; // target sleep hours (default 8)

    private Double remSleepHours; // REM sleep

    private Double deepSleepHours; // Deep sleep

    private Double lightSleepHours; // Light sleep

    private String notes;

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}

