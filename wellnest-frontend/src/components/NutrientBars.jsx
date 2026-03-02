import React from 'react';
import './NutrientBars.css';

export default function NutrientBars({ protein, carbs, fats, compact = false }) {
  const total = protein + carbs + fats || 1;
  const proteinPercent = (protein / total) * 100;
  const carbsPercent = (carbs / total) * 100;
  const fatsPercent = (fats / total) * 100;

  const nutrients = [
    { label: 'Protein', value: protein, percent: proteinPercent, color: '#ef4444', unit: 'g' },
    { label: 'Carbs', value: carbs, percent: carbsPercent, color: '#f59e0b', unit: 'g' },
    { label: 'Fats', value: fats, percent: fatsPercent, color: '#8b5cf6', unit: 'g' },
  ];

  return (
    <div className={`nutrient-bars ${compact ? 'compact' : ''}`}>
      {nutrients.map((nutrient) => (
        <div key={nutrient.label} className="nutrient-bar-item">
          <div className="nutrient-bar-header">
            <span className="nutrient-label" style={{ color: nutrient.color }}>
              {nutrient.label}
            </span>
            <span className="nutrient-value">
              {nutrient.value}{nutrient.unit}
            </span>
          </div>
          <div className="nutrient-bar-track">
            <div
              className="nutrient-bar-fill"
              style={{
                width: `${Math.min(nutrient.percent, 100)}%`,
                background: nutrient.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
