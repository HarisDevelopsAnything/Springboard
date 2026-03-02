import React, { useState, useEffect } from 'react';
import trackerService from '../../services/trackerService';
import WorkoutCircle from '../../components/WorkoutCircle';
import { Dumbbell, Plus, Trash2 } from 'lucide-react';
import './WorkoutTracker.css';

export default function WorkoutTracker() {
  const [workouts, setWorkouts] = useState([]);
  const [todayWorkouts, setTodayWorkouts] = useState([]);
  const [form, setForm] = useState({ 
    date: new Date().toISOString().slice(0,10), 
    exerciseType: '', 
    durationMinutes: '', 
    caloriesBurned: '', 
    notes: '' 
  });
  const [calorieGoal, setCalorieGoal] = useState(500);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => { fetchWorkouts(); }, []);

  const fetchWorkouts = async () => {
    try {
      const res = await trackerService.listWorkouts();
      setWorkouts(res.data);
      setTodayWorkouts(res.data.filter(w => w.date === today));
    } catch (e) {
      console.error(e);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const quickAddWorkout = async (type, duration, calories) => {
    try {
      await trackerService.createWorkout({
        date: today,
        exerciseType: type,
        durationMinutes: duration,
        caloriesBurned: calories,
        notes: '',
      });
      fetchWorkouts();
    } catch (e) { console.error(e); }
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await trackerService.createWorkout({
        date: form.date,
        exerciseType: form.exerciseType,
        durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : null,
        caloriesBurned: form.caloriesBurned ? parseInt(form.caloriesBurned) : null,
        notes: form.notes,
      });
      setForm({ ...form, exerciseType: '', durationMinutes: '', caloriesBurned: '', notes: '' });
      fetchWorkouts();
    } catch (e) { console.error(e); }
  };

  const remove = async (id) => {
    try { await trackerService.deleteWorkout(id); fetchWorkouts(); } catch (e) { console.error(e); }
  };

  const quickWorkouts = [
    { type: 'Cardio', duration: 30, calories: 200, icon: '🏃' },
    { type: 'Strength', duration: 45, calories: 150, icon: '💪' },
    { type: 'Yoga', duration: 60, calories: 120, icon: '🧘' },
    { type: 'HIIT', duration: 20, calories: 250, icon: '🔥' },
  ];

  return (
    <div className="workout-tracker-page">
      <h2 className="page-title">💪 Workout Tracker</h2>
      
      <div className="workout-layout">
        <div className="workout-today-section">
          <h3 className="section-title">Today's Activity</h3>
          
          {todayWorkouts.length > 0 ? (
            <div className="workout-visualization-card">
              <WorkoutCircle workouts={todayWorkouts} calorieGoal={calorieGoal} />
            </div>
          ) : (
            <div className="workout-empty-state">
              <Dumbbell style={{ width: 48, height: 48, color: '#f87171', opacity: 0.5 }} />
              <p>No workouts logged today</p>
              <span>Start tracking your exercises below</span>
            </div>
          )}

          <div className="workout-goal-setter">
            <label>Daily Calorie Goal:</label>
            <div className="goal-input-group">
              <button onClick={() => setCalorieGoal(Math.max(100, calorieGoal - 50))}>−</button>
              <input 
                type="number" 
                min="100" 
                max="2000" 
                step="50"
                value={calorieGoal} 
                onChange={(e) => setCalorieGoal(parseInt(e.target.value) || 500)}
              />
              <button onClick={() => setCalorieGoal(Math.min(2000, calorieGoal + 50))}>+</button>
            </div>
          </div>
        </div>

        <div className="workout-add-section">
          <h3 className="section-title">Quick Add</h3>
          <div className="quick-workout-grid">
            {quickWorkouts.map(qw => (
              <button 
                key={qw.type}
                className="quick-workout-btn"
                onClick={() => quickAddWorkout(qw.type, qw.duration, qw.calories)}
              >
                <span className="quick-workout-icon">{qw.icon}</span>
                <span className="quick-workout-name">{qw.type}</span>
                <span className="quick-workout-details">{qw.duration}min • {qw.calories}cal</span>
              </button>
            ))}
          </div>

          <h3 className="section-title" style={{ marginTop: '2rem' }}>Custom Workout</h3>
          <form onSubmit={submit} className="workout-form">
            <input 
              type="date" 
              name="date" 
              value={form.date} 
              onChange={handleChange} 
              required 
            />
            <input 
              name="exerciseType" 
              placeholder="Exercise type (e.g., Running, Swimming)" 
              value={form.exerciseType} 
              onChange={handleChange} 
              required 
            />
            <div className="form-row">
              <input 
                name="durationMinutes" 
                type="number"
                placeholder="Duration (min)" 
                value={form.durationMinutes} 
                onChange={handleChange} 
              />
              <input 
                name="caloriesBurned" 
                type="number"
                placeholder="Calories" 
                value={form.caloriesBurned} 
                onChange={handleChange} 
              />
            </div>
            <textarea 
              name="notes" 
              placeholder="Notes (optional)" 
              value={form.notes} 
              onChange={handleChange}
              rows="2"
            />
            <button type="submit" className="add-workout-btn">
              <Plus style={{ width: 20, height: 20 }} />
              Add Workout
            </button>
          </form>
        </div>
      </div>

      <div className="workout-history-section">
        <h3 className="section-title">Workout History</h3>
        <div className="workout-history-list">
          {workouts.slice().reverse().map((w) => (
            <div key={w.id} className="workout-history-item">
              <div className="workout-history-header">
                <div className="workout-history-date">
                  {new Date(w.date).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </div>
                <button className="workout-delete-btn" onClick={() => remove(w.id)}>
                  <Trash2 style={{ width: 16, height: 16 }} />
                </button>
              </div>
              <div className="workout-history-type">{w.exerciseType}</div>
              <div className="workout-history-stats">
                {w.durationMinutes && <span>⏱️ {w.durationMinutes} min</span>}
                {w.caloriesBurned && <span>🔥 {w.caloriesBurned} kcal</span>}
              </div>
              {w.notes && <div className="workout-history-notes">{w.notes}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
