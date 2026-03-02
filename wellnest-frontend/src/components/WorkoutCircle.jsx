import React from 'react';
import './WorkoutCircle.css';
import { Dumbbell, Flame, Clock } from 'lucide-react';

export default function WorkoutCircle({ workouts, calorieGoal = 500, compact = false }) {
  const totalCalories = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);
  const totalDuration = workouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);
  const percentage = calorieGoal > 0 ? Math.min((totalCalories / calorieGoal) * 100, 100) : 0;
  
  // Group workouts by exercise type
  const typeBreakdown = workouts.reduce((acc, w) => {
    const type = w.exerciseType || 'Other';
    if (!acc[type]) acc[type] = { count: 0, calories: 0, duration: 0 };
    acc[type].count += 1;
    acc[type].calories += w.caloriesBurned || 0;
    acc[type].duration += w.durationMinutes || 0;
    return acc;
  }, {});

  const exerciseTypes = Object.entries(typeBreakdown).map(([type, data]) => ({
    type,
    ...data,
    color: getExerciseColor(type)
  }));

  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={`workout-circle-container ${compact ? 'compact' : ''}`}>
      {compact ? (
        <div className="workout-compact-view">
          <div className="workout-circle-progress">
            <svg width="100" height="100" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="rgba(239, 68, 68, 0.1)"
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke="#ef4444"
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <div className="workout-circle-content">
              <Flame style={{ width: 20, height: 20, color: '#ef4444' }} />
              <div className="workout-circle-value">{totalCalories}</div>
              <div className="workout-circle-unit">kcal</div>
            </div>
          </div>
          <div className="workout-compact-stats">
            <div className="workout-compact-stat">
              <Clock style={{ width: 16, height: 16, color: '#f87171' }} />
              <span>{totalDuration} min</span>
            </div>
            <div className="workout-compact-stat">
              <Dumbbell style={{ width: 16, height: 16, color: '#f87171' }} />
              <span>{workouts.length} {workouts.length === 1 ? 'session' : 'sessions'}</span>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="workout-circle-main">
            <div className="workout-circle-progress large">
              <svg width="200" height="200" viewBox="0 0 220 220">
                <circle
                  cx="110"
                  cy="110"
                  r="100"
                  fill="none"
                  stroke="rgba(239, 68, 68, 0.1)"
                  strokeWidth="12"
                />
                <circle
                  cx="110"
                  cy="110"
                  r="100"
                  fill="none"
                  stroke="#ef4444"
                  strokeWidth="12"
                  strokeDasharray={circumference * 1.85}
                  strokeDashoffset={(circumference * 1.85) - (percentage / 100) * (circumference * 1.85)}
                  strokeLinecap="round"
                  transform="rotate(-90 110 110)"
                  style={{ transition: 'stroke-dashoffset 0.8s ease' }}
                />
              </svg>
              <div className="workout-circle-content large">
                <Flame style={{ width: 32, height: 32, color: '#ef4444' }} />
                <div className="workout-circle-value large">{totalCalories}</div>
                <div className="workout-circle-unit">kcal burned</div>
                <div className="workout-circle-goal">of {calorieGoal} goal</div>
              </div>
            </div>
            
            <div className="workout-stats-grid">
              <div className="workout-stat-item">
                <Clock style={{ width: 24, height: 24, color: '#f87171' }} />
                <div className="workout-stat-value">{totalDuration}</div>
                <div className="workout-stat-label">Minutes</div>
              </div>
              <div className="workout-stat-item">
                <Dumbbell style={{ width: 24, height: 24, color: '#f87171' }} />
                <div className="workout-stat-value">{workouts.length}</div>
                <div className="workout-stat-label">Sessions</div>
              </div>
            </div>
          </div>

          {exerciseTypes.length > 0 && (
            <div className="workout-breakdown">
              <h4>Exercise Breakdown</h4>
              {exerciseTypes.map(ex => (
                <div key={ex.type} className="workout-exercise-item">
                  <div className="workout-exercise-header">
                    <span className="workout-exercise-dot" style={{ background: ex.color }}></span>
                    <span className="workout-exercise-type">{ex.type}</span>
                    <span className="workout-exercise-count">{ex.count}x</span>
                  </div>
                  <div className="workout-exercise-stats">
                    <span>{ex.duration} min</span>
                    <span>{ex.calories} kcal</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function getExerciseColor(type) {
  const colors = {
    cardio: '#ef4444',
    strength: '#f97316',
    yoga: '#ec4899',
    running: '#dc2626',
    cycling: '#ea580c',
    swimming: '#3b82f6',
    walking: '#f59e0b',
    hiit: '#b91c1c'
  };
  return colors[type.toLowerCase()] || '#f87171';
}
