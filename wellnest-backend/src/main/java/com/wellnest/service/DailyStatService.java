package com.wellnest.service;

import com.wellnest.dto.tracker.DailyStatDto;
import com.wellnest.dto.tracker.DailyStatRequest;
import com.wellnest.entity.DailyStat;
import com.wellnest.repository.DailyStatRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class DailyStatService {

    private final DailyStatRepository dailyStatRepository;

    public DailyStatDto upsertDailyStat(String userId, DailyStatRequest req) {
        LocalDate date = req.getDate();
        DailyStat stat = dailyStatRepository.findByUserIdAndDate(userId, date)
                .orElseGet(() -> DailyStat.builder().userId(userId).date(date).build());
        stat.setWaterLiters(req.getWaterLiters());
        stat.setSleepHours(req.getSleepHours());
        stat.setSteps(req.getSteps());
        stat.setNotes(req.getNotes());
        DailyStat saved = dailyStatRepository.save(stat);
        return toDto(saved);
    }

    public DailyStatDto getDailyStat(String userId, LocalDate date) {
        return dailyStatRepository.findByUserIdAndDate(userId, date)
                .map(this::toDto)
                .orElse(null);
    }

    private DailyStatDto toDto(DailyStat s) {
        return DailyStatDto.builder()
                .id(s.getId())
                .date(s.getDate())
                .waterLiters(s.getWaterLiters())
                .sleepHours(s.getSleepHours())
            .steps(s.getSteps())
                .notes(s.getNotes())
                .build();
    }
}
