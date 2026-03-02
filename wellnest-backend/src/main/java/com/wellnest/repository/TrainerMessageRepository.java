package com.wellnest.repository;

import com.wellnest.entity.TrainerMessage;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrainerMessageRepository extends MongoRepository<TrainerMessage, String> {
    List<TrainerMessage> findByTraineeIdOrderByCreatedAtDesc(String traineeId);
    List<TrainerMessage> findByTrainerIdOrderByCreatedAtDesc(String trainerId);
    List<TrainerMessage> findByTraineeIdAndReadFalseOrderByCreatedAtDesc(String traineeId);
}
