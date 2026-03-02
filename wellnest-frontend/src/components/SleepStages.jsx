import React from 'react';
import './SleepStages.css';

export default function SleepStages({ total, goal, rem, deep, light, compact = false }) {
  const percentage = goal > 0 ? Math.min((total / goal) * 100, 100) : 0;
  
  const stages = [
    { name: 'REM', value: rem || 0, color: '#a78bfa', label: 'REM' },
    { name: 'Deep', value: deep || 0, color: '#6366f1', label: 'Deep' },
    { name: 'Light', value: light || 0, color: '#818cf8', label: 'Light' }
  ];

  return (
    <div className={`sleep-stages-container ${compact ? 'compact' : ''}`}>
      {compact ? (
        <>
          <div className="sleep-compact-info">
            <div className="sleep-compact-total">{total.toFixed(1)}h / {goal}h</div>
            <div className="sleep-compact-percentage">{Math.round(percentage)}%</div>
          </div>
          <div className="sleep-stages-bars">
            {stages.map(stage => {
              const stageWidth = total > 0 ? (stage.value / total) * 100 : 0;
              return (
                <div 
                  key={stage.name} 
                  className="sleep-stage-bar-wrapper"
                  style={{ width: `${stageWidth}%` }}
                >
                  <div 
                    className="sleep-stage-bar" 
                    style={{ 
                      width: '100%',
                      background: stage.color 
                    }}
                  />
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <>
          <div className="sleep-summary">
            <div className="sleep-total">{total.toFixed(1)}h</div>
            <div className="sleep-goal-text">of {goal}h goal</div>
            <div className="sleep-percentage">{Math.round(percentage)}%</div>
          </div>
          
          <div className="sleep-stages-breakdown">
            {stages.map(stage => {
              const stagePercentage = total > 0 ? (stage.value / total) * 100 : 0;
              return (
                <div key={stage.name} className="sleep-stage">
                  <div className="sleep-stage-header">
                    <span className="sleep-stage-dot" style={{ background: stage.color }}></span>
                    <span className="sleep-stage-label">{stage.label}</span>
                    <span className="sleep-stage-value">{stage.value.toFixed(1)}h</span>
                  </div>
                  <div className="sleep-stage-bar-container">
                    <div 
                      className="sleep-stage-bar-fill" 
                      style={{ 
                        width: `${stagePercentage}%`,
                        background: stage.color 
                      }}
                    />
                  </div>
                  <div className="sleep-stage-percent">{Math.round(stagePercentage)}%</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
