package com.wellnest.service;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class HealthTipService {

    private static final List<Map<String, String>> HEALTH_TIPS = List.of(
            Map.of(
                    "tip", "Drink enough water through the day; clear or light-yellow urine usually means you are well hydrated.",
                    "source", "WellNest Health Library"
            ),
            Map.of(
                    "tip", "Aim for 7-9 hours of sleep nightly to support recovery, immunity, and mental focus.",
                    "source", "WellNest Health Library"
            ),
            Map.of(
                    "tip", "Fill at least half your plate with vegetables and fruit to improve fiber, vitamins, and mineral intake.",
                    "source", "WellNest Health Library"
            ),
            Map.of(
                    "tip", "Include protein in each main meal to help preserve muscle mass and improve satiety.",
                    "source", "WellNest Health Library"
            ),
            Map.of(
                    "tip", "Take a 5-minute movement break each hour if you sit for long periods to reduce stiffness and improve circulation.",
                    "source", "WellNest Health Library"
            ),
            Map.of(
                    "tip", "Limit highly processed foods and added sugars; prioritize whole foods for better long-term metabolic health.",
                    "source", "WellNest Health Library"
            ),
            Map.of(
                    "tip", "Do at least 150 minutes of moderate aerobic activity weekly and include strength training at least twice per week.",
                    "source", "WellNest Health Library"
            ),
            Map.of(
                    "tip", "Track your blood pressure periodically if possible; early detection helps prevent heart-related complications.",
                    "source", "WellNest Health Library"
            ),
            Map.of(
                    "tip", "Manage stress with breathing, walking, or mindfulness for a few minutes daily to support heart and mental health.",
                    "source", "WellNest Health Library"
            ),
            Map.of(
                    "tip", "Protect your posture: keep screens at eye level and shoulders relaxed to reduce neck and back strain.",
                    "source", "WellNest Health Library"
            )
    );

    public Map<String, String> getRandomTip() {
        int index = ThreadLocalRandom.current().nextInt(HEALTH_TIPS.size());
        return HEALTH_TIPS.get(index);
    }
}
