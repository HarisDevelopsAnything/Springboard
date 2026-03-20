package com.wellnest.controller;

import com.wellnest.service.HealthTipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/health-tips")
@RequiredArgsConstructor
public class HealthTipController {

    private final HealthTipService healthTipService;

    @GetMapping("/random")
    public ResponseEntity<Map<String, Object>> getRandomHealthTip() {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("data", healthTipService.getRandomTip());
        return ResponseEntity.ok(response);
    }
}
