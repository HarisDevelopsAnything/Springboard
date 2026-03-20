package com.wellnest.controller;

import com.wellnest.dto.bmi.BmiCalculationResponse;
import com.wellnest.dto.weight.WeightEntryRequest;
import com.wellnest.dto.weight.WeightHistoryDto;
import com.wellnest.security.CustomUserDetails;
import com.wellnest.service.BmiService;
import com.wellnest.service.WeightHistoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/weight")
@RequiredArgsConstructor
public class WeightController {
    private final WeightHistoryService weightHistoryService;
    private final BmiService bmiService;

    @PostMapping("/add")
    public ResponseEntity<Map<String, Object>> addWeight(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody WeightEntryRequest request) {
        try {
            String userId = userDetails.getId();
            WeightHistoryDto weightHistory = weightHistoryService.addWeightEntry(userId, request);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", weightHistory);
            response.put("message", "Weight entry added successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/history")
    public ResponseEntity<Map<String, Object>> getHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String userId = userDetails.getId();
            List<WeightHistoryDto> history = weightHistoryService.getWeightHistory(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", history);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @GetMapping("/history/range")
    public ResponseEntity<Map<String, Object>> getHistoryRange(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam String startDate,
            @RequestParam String endDate) {
        try {
            String userId = userDetails.getId();
            LocalDate start = LocalDate.parse(startDate);
            LocalDate end = LocalDate.parse(endDate);
            List<WeightHistoryDto> history = weightHistoryService.getWeightHistoryRange(userId, start, end);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", history);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{entryId}")
    public ResponseEntity<Map<String, Object>> deleteEntry(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable String entryId) {
        try {
            String userId = userDetails.getId();
            weightHistoryService.deleteWeightEntry(userId, entryId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Weight entry deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/calculate-bmi")
    public ResponseEntity<Map<String, Object>> calculateBmi(
            @RequestParam Double weight,
            @RequestParam Double height) {
        try {
            BmiCalculationResponse bmiCalc = bmiService.calculateBmi(weight, height);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("data", bmiCalc);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
