import React from 'react';
import './WaterWave.css';

export default function WaterWave({ current, goal, compact = false }) {
  const percentage = goal > 0 ? Math.min((current / goal) * 100, 100) : 0;
  
  return (
    <div className={`water-wave-container ${compact ? 'compact' : ''}`}>
      <div className="water-wave-fill" style={{ height: `${percentage}%` }}>
        <div className="water-wave"></div>
      </div>
      <div className="water-wave-content">
        {compact ? (
          <div className="water-compact">{current.toFixed(1)}L / {goal}L</div>
        ) : (
          <>
            <div className="water-amount">{current.toFixed(1)}L</div>
            <div className="water-goal">of {goal}L goal</div>
            <div className="water-percentage">{Math.round(percentage)}%</div>
          </>
        )}
      </div>
    </div>
  );
}
