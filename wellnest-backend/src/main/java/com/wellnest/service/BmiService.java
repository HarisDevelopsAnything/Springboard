package com.wellnest.service;

import com.wellnest.dto.bmi.BmiCalculationResponse;
import org.springframework.stereotype.Service;

@Service
public class BmiService {

    public BmiCalculationResponse calculateBmi(Double weightKg, Double heightCm) {
        if (weightKg == null || weightKg <= 0 || heightCm == null || heightCm <= 0) {
            throw new IllegalArgumentException("Weight and height must be positive values");
        }

        // Convert height from cm to meters
        double heightM = heightCm / 100.0;
        
        // Calculate BMI
        double bmi = weightKg / (heightM * heightM);
        bmi = Math.round(bmi * 100.0) / 100.0; // Round to 2 decimal places

        // Determine category
        String category = getBmiCategory(bmi);

        // Calculate ideal weight range (BMI 18.5-24.9)
        double idealWeightMin = 18.5 * heightM * heightM;
        double idealWeightMax = 24.9 * heightM * heightM;

        // Get recommendations
        String workoutRecommendation = getWorkoutRecommendation(category);
        String nutritionRecommendation = getNutritionRecommendation(category);

        return BmiCalculationResponse.builder()
                .bmi(bmi)
                .category(category)
                .workoutRecommendation(workoutRecommendation)
                .nutritionRecommendation(nutritionRecommendation)
                .idealWeightMin(Math.round(idealWeightMin * 100.0) / 100.0)
                .idealWeightMax(Math.round(idealWeightMax * 100.0) / 100.0)
                .build();
    }

    public String getBmiCategory(double bmi) {
        if (bmi < 18.5) return "UNDERWEIGHT";
        if (bmi < 25.0) return "NORMAL";
        if (bmi < 30.0) return "OVERWEIGHT";
        return "OBESE";
    }

    private String getWorkoutRecommendation(String category) {
        switch (category) {
            case "UNDERWEIGHT":
                return "Focus on strength training and resistance exercises. Include 3-4 sessions per week with compound movements like squats, deadlifts, and bench press. Avoid excessive cardio.";
            
            case "NORMAL":
                return "Maintain your weight with a balanced routine. Mix cardio (30 min, 3x/week) with strength training (3x/week). Include activities you enjoy to stay consistent.";
            
            case "OVERWEIGHT":
                return "Combine cardio and strength training for fat loss. Start with 4-5 cardio sessions (30-45 min) and 2-3 strength sessions per week. Gradually increase intensity.";
            
            case "OBESE":
                return "Begin with low-impact cardio like walking, swimming, or cycling (30-45 min daily). Add light strength training 2x/week. Focus on consistency over intensity. Consult your doctor before starting.";
            
            default:
                return "Maintain a balanced exercise routine with both cardio and strength training.";
        }
    }

    private String getNutritionRecommendation(String category) {
        switch (category) {
            case "UNDERWEIGHT":
                return "Calorie surplus of 300-500 calories above maintenance. High protein (1.6-2g per kg body weight), healthy fats, and complex carbs. Eat 5-6 smaller meals throughout the day. Include nuts, avocados, whole grains, and lean proteins.";
            
            case "NORMAL":
                return "Balanced diet at maintenance calories. Include lean proteins, whole grains, fruits, vegetables, and healthy fats. Stay hydrated with 2-3 liters of water daily. Limit processed foods and added sugars.";
            
            case "OVERWEIGHT":
                return "Calorie deficit of 300-500 calories below maintenance. High protein (1.2-1.6g per kg), moderate carbs, healthy fats. Focus on vegetables, lean proteins, whole grains. Limit refined carbs and sugary drinks. Drink 3-4 liters of water daily.";
            
            case "OBESE":
                return "Calorie deficit of 500-750 calories (consult dietitian). High protein to preserve muscle. Emphasize vegetables, lean proteins, and fiber. Eliminate sugary drinks, processed foods, and excessive fats. Portion control is key. Drink 3-4 liters of water daily.";
            
            default:
                return "Maintain a balanced diet with adequate protein, complex carbohydrates, and healthy fats.";
        }
    }
}
