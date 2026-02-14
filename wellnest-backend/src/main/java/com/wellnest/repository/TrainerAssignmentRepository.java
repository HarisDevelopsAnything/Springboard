package com.wellnest.repository;

import com.wellnest.entity.TrainerAssignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrainerAssignmentRepository extends MongoRepository<TrainerAssignment, String> {

    /** Check if a trainee already has an assignment for a specific date */
    Optional<TrainerAssignment> findByTraineeIdAndDate(String traineeId, LocalDate date);

    /** Check if a trainee already has an assignment for a date */
    boolean existsByTraineeIdAndDate(String traineeId, LocalDate date);

    /** Get all active assignments for a trainer (their current trainees) */
    List<TrainerAssignment> findByTrainerIdAndActiveTrue(String trainerId);

    /** Get all assignments for a trainer on a specific date */
    List<TrainerAssignment> findByTrainerIdAndDate(String trainerId, LocalDate date);

    /** Get all assignments for a trainer (all-time) */
    List<TrainerAssignment> findByTrainerId(String trainerId);
}
