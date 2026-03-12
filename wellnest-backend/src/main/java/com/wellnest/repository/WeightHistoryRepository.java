package com.wellnest.repository;

import com.wellnest.entity.WeightHistory;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface WeightHistoryRepository extends MongoRepository<WeightHistory, String> {
    List<WeightHistory> findByUserIdOrderByDateDesc(String userId);
    Optional<WeightHistory> findByUserIdAndDate(String userId, LocalDate date);
    List<WeightHistory> findByUserIdAndDateBetweenOrderByDate(String userId, LocalDate startDate, LocalDate endDate);
}
