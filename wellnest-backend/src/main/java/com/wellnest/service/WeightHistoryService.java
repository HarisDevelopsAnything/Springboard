package com.wellnest.service;

import com.wellnest.dto.bmi.BmiCalculationResponse;
import com.wellnest.dto.weight.WeightEntryRequest;
import com.wellnest.dto.weight.WeightHistoryDto;
import com.wellnest.entity.FitnessProfile;
import com.wellnest.entity.WeightHistory;
import com.wellnest.repository.FitnessProfileRepository;
import com.wellnest.repository.WeightHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WeightHistoryService {
    private final WeightHistoryRepository weightHistoryRepository;
    private final FitnessProfileRepository fitnessProfileRepository;
    private final BmiService bmiService;

    public WeightHistoryDto addWeightEntry(String userId, WeightEntryRequest request) {
        // Get user's height from fitness profile
        FitnessProfile profile = fitnessProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Please complete your fitness profile first"));

        if (profile.getHeight() == null || profile.getHeight() <= 0) {
            throw new RuntimeException("Height is required in your fitness profile");
        }

        // Calculate BMI
        BmiCalculationResponse bmiCalc = bmiService.calculateBmi(request.getWeight(), profile.getHeight());

        // Check if entry for this date already exists
        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();
        WeightHistory existing = weightHistoryRepository.findByUserIdAndDate(userId, date).orElse(null);

        WeightHistory weightHistory;
        if (existing != null) {
            // Update existing entry
            existing.setWeight(request.getWeight());
            existing.setBmi(bmiCalc.getBmi());
            existing.setBmiCategory(bmiCalc.getCategory());
            existing.setNotes(request.getNotes());
            weightHistory = weightHistoryRepository.save(existing);
        } else {
            // Create new entry
            weightHistory = WeightHistory.builder()
                    .userId(userId)
                    .date(date)
                    .weight(request.getWeight())
                    .bmi(bmiCalc.getBmi())
                    .bmiCategory(bmiCalc.getCategory())
                    .notes(request.getNotes())
                    .build();
            weightHistory = weightHistoryRepository.save(weightHistory);
        }

        // Update fitness profile with latest weight
        profile.setWeight(request.getWeight());
        fitnessProfileRepository.save(profile);

        return mapToDto(weightHistory);
    }

    public List<WeightHistoryDto> getWeightHistory(String userId) {
        List<WeightHistory> history = weightHistoryRepository.findByUserIdOrderByDateDesc(userId);
        return history.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public List<WeightHistoryDto> getWeightHistoryRange(String userId, LocalDate startDate, LocalDate endDate) {
        List<WeightHistory> history = weightHistoryRepository.findByUserIdAndDateBetweenOrderByDate(
                userId, startDate, endDate);
        return history.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public void deleteWeightEntry(String userId, String entryId) {
        WeightHistory entry = weightHistoryRepository.findById(entryId)
                .orElseThrow(() -> new RuntimeException("Weight entry not found"));
        
        if (!entry.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        
        weightHistoryRepository.delete(entry);
    }

    private WeightHistoryDto mapToDto(WeightHistory entity) {
        return WeightHistoryDto.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .date(entity.getDate())
                .weight(entity.getWeight())
                .bmi(entity.getBmi())
                .bmiCategory(entity.getBmiCategory())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
