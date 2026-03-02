package com.wellnest.service;

import com.wellnest.dto.tracker.MealDto;
import com.wellnest.dto.tracker.MealRequest;
import com.wellnest.entity.Meal;
import com.wellnest.repository.MealRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MealService {

    private final MealRepository mealRepository;

    public MealDto createMeal(String userId, MealRequest req) {
        Meal m = Meal.builder()
                .userId(userId)
                .date(req.getDate())
                .mealType(req.getMealType())
                .calories(req.getCalories())
                .protein(req.getProtein())
                .carbs(req.getCarbs())
                .fats(req.getFats())
                .items(req.getItems())
                .notes(req.getNotes())
                .build();
        return toDto(mealRepository.save(m));
    }

    public List<MealDto> listMeals(String userId) {
        return mealRepository.findByUserIdOrderByDateDesc(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public MealDto getMeal(String userId, String id) {
        return mealRepository.findById(id)
                .filter(m -> m.getUserId().equals(userId))
                .map(this::toDto)
                .orElseThrow(() -> new RuntimeException("Meal not found"));
    }

    public MealDto updateMeal(String userId, String id, MealRequest req) {
        Meal m = mealRepository.findById(id)
                .filter(x -> x.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Meal not found"));
        m.setDate(req.getDate());
        m.setMealType(req.getMealType());
        m.setCalories(req.getCalories());
        m.setProtein(req.getProtein());
        m.setCarbs(req.getCarbs());
        m.setFats(req.getFats());
        m.setItems(req.getItems());
        m.setNotes(req.getNotes());
        return toDto(mealRepository.save(m));
    }

    public void deleteMeal(String userId, String id) {
        Meal m = mealRepository.findById(id)
                .filter(x -> x.getUserId().equals(userId))
                .orElseThrow(() -> new RuntimeException("Meal not found"));
        mealRepository.delete(m);
    }

    private MealDto toDto(Meal m) {
        return MealDto.builder()
                .id(m.getId())
                .date(m.getDate())
                .mealType(m.getMealType())
                .calories(m.getCalories())
                .protein(m.getProtein())
                .carbs(m.getCarbs())
                .fats(m.getFats())
                .items(m.getItems())
                .notes(m.getNotes())
                .build();
    }
}
