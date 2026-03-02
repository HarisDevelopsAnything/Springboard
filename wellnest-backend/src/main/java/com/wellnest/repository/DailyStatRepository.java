package com.wellnest.repository;

import com.wellnest.entity.DailyStat;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyStatRepository extends MongoRepository<DailyStat, String> {
    List<DailyStat> findAllByUserId(String userId);
    java.util.Optional<DailyStat> findByUserIdAndDate(String userId, LocalDate date);
}
