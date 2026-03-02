package com.wellnest.repository;

import com.wellnest.entity.Meal;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface MealRepository extends MongoRepository<Meal, String> {
    List<Meal> findAllByUserId(String userId);
    List<Meal> findAllByUserIdAndDateBetween(String userId, LocalDate start, LocalDate end);
    // Backwards-compat helper used by MealService
    List<Meal> findByUserIdOrderByDateDesc(String userId);
    List<Meal> findByUserIdAndDate(String userId, LocalDate date);
}


