package com.wellnest.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Tracks which trainee is assigned to which trainer on a given date.
 * A trainee can only have ONE trainer per day.
 */
@Document(collection = "trainer_assignments")
@CompoundIndex(name = "trainee_date_unique", def = "{'traineeId': 1, 'date': 1}", unique = true)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class TrainerAssignment {

    @Id
    private String id;

    /** The user (trainee) who selected a trainer */
    private String traineeId;

    /** The trainer selected */
    private String trainerId;

    /** The date of the assignment (one trainer per trainee per day) */
    private LocalDate date;

    /** Whether the assignment is currently active */
    @Builder.Default
    private boolean active = true;

    @CreatedDate
    private LocalDateTime createdAt;
}
