package com.wellnest.repository;

import com.wellnest.entity.WorkoutAssignment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutAssignmentRepository extends MongoRepository<WorkoutAssignment, String> {
    List<WorkoutAssignment> findByTraineeIdOrderByCreatedAtDesc(String traineeId);
    List<WorkoutAssignment> findByTrainerIdOrderByCreatedAtDesc(String trainerId);
    Optional<WorkoutAssignment> findByTraineeIdAndIsActiveTrue(String traineeId);
    List<WorkoutAssignment> findByTraineeIdAndIsActiveTrueOrderByCreatedAtDesc(String traineeId);
}
