package com.wellnest.repository;

import com.wellnest.entity.Workout;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface WorkoutRepository extends MongoRepository<Workout, String> {
    List<Workout> findAllByUserId(String userId);
    List<Workout> findAllByUserIdAndDateBetween(String userId, LocalDate start, LocalDate end);
    List<Workout> findByUserIdOrderByDateDesc(String userId);
    List<Workout> findByUserIdAndDate(String userId, LocalDate date);
}

