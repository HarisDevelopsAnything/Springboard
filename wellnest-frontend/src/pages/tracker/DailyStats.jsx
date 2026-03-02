import React, { useState, useEffect } from 'react';
import trackerService from '../../services/trackerService';
import WaterWave from '../../components/WaterWave';
import SleepStages from '../../components/SleepStages';
import './DailyStats.css';

export default function DailyStats() {
  const [stats, setStats] = useState([]);
  const [todayStat, setTodayStat] = useState(null);
  const [waterInput, setWaterInput] = useState('');
  const [sleepInput, setSleepInput] = useState('');
  const [waterGoal, setWaterGoal] = useState(3);
  const [sleepGoal, setSleepGoal] = useState(8);
  const [remSleep, setRemSleep] = useState('');
  const [deepSleep, setDeepSleep] = useState('');
  const [lightSleep, setLightSleep] = useState('');
  const [notes, setNotes] = useState('');
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    try {
      const res = await trackerService.listDailyStats();
      setStats(res.data);
      const found = res.data.find(s => s.date === today);
      if (found) {
        setTodayStat(found);
        if (found.waterGoalLiters) setWaterGoal(found.waterGoalLiters);
        if (found.sleepGoalHours) setSleepGoal(found.sleepGoalHours);
      }
    } catch (e) { console.error(e); }
  };

  const updateWater = async (amount) => {
    const current = todayStat?.waterLiters || 0;
    const newAmount = Math.max(0, current + amount);
    try {
      await trackerService.upsertDailyStat({
        date: today,
        waterLiters: newAmount,
        waterGoalLiters: waterGoal,
        sleepHours: todayStat?.sleepHours,
        notes: todayStat?.notes || '',
      });
      fetchStats();
    } catch (e) { console.error(e); }
  };

  const saveSleep = async () => {
    if (!sleepInput) return;
    try {
      await trackerService.upsertDailyStat({
        date: today,
        waterLiters: todayStat?.waterLiters,
        waterGoalLiters: waterGoal,
        sleepHours: parseFloat(sleepInput),
        sleepGoalHours: sleepGoal,
        remSleepHours: remSleep ? parseFloat(remSleep) : null,
        deepSleepHours: deepSleep ? parseFloat(deepSleep) : null,
        lightSleepHours: lightSleep ? parseFloat(lightSleep) : null,
        notes: notes,
      });
      setSleepInput('');
      setRemSleep('');
      setDeepSleep('');
      setLightSleep('');
      setNotes('');
      fetchStats();
    } catch (e) { console.error(e); }
  };

  const updateGoal = async (newGoal) => {
    const clamped = Math.max(2, Math.min(6, newGoal));
    setWaterGoal(clamped);
    try {
      await trackerService.upsertDailyStat({
        date: today,
        waterLiters: todayStat?.waterLiters || 0,
        waterGoalLiters: clamped,
        sleepHours: todayStat?.sleepHours,
        sleepGoalHours: sleepGoal,
        remSleepHours: todayStat?.remSleepHours,
        deepSleepHours: todayStat?.deepSleepHours,
        lightSleepHours: todayStat?.lightSleepHours,
        notes: todayStat?.notes || '',
      });
      fetchStats();
    } catch (e) { console.error(e); }
  };

  const updateSleepGoal = async (newGoal) => {
    const clamped = Math.max(6, Math.min(10, newGoal));
    setSleepGoal(clamped);
    try {
      await trackerService.upsertDailyStat({
        date: today,
        waterLiters: todayStat?.waterLiters,
        waterGoalLiters: waterGoal,
        sleepHours: todayStat?.sleepHours || 0,
        sleepGoalHours: clamped,
        remSleepHours: todayStat?.remSleepHours,
        deepSleepHours: todayStat?.deepSleepHours,
        lightSleepHours: todayStat?.lightSleepHours,
        notes: todayStat?.notes || '',
      });
      fetchStats();
    } catch (e) { console.error(e); }
  };

  const currentWater = todayStat?.waterLiters || 0;
  const currentSleep = todayStat?.sleepHours || 0;
  const currentRem = todayStat?.remSleepHours || 0;
  const currentDeep = todayStat?.deepSleepHours || 0;
  const currentLight = todayStat?.lightSleepHours || 0;

  return (
    <div className="daily-stats-page">
      <h2 className="page-title">Hydration & Sleep Tracker</h2>
      
      <div className="stats-grid-layout">
        <div className="water-card">
          <h3 className="card-title">💧 Water Intake Today</h3>
          
          <WaterWave current={currentWater} goal={waterGoal} />
          
          <div className="water-controls">
            <div className="quick-add-buttons">
              <button className="quick-btn" onClick={() => updateWater(0.25)}>+0.25L</button>
              <button className="quick-btn" onClick={() => updateWater(0.5)}>+0.5L</button>
              <button className="quick-btn" onClick={() => updateWater(1)}>+1L</button>
              <button className="quick-btn reset-btn" onClick={() => updateWater(-currentWater)}>Reset</button>
            </div>
            
            <div className="goal-setter">
              <label>Daily Goal (2-6L):</label>
              <div className="goal-input-group">
                <button onClick={() => updateGoal(waterGoal - 0.5)}>−</button>
                <input 
                  type="number" 
                  min="2" 
                  max="6" 
                  step="0.5"
                  value={waterGoal} 
                  onChange={(e) => updateGoal(parseFloat(e.target.value))}
                />
                <button onClick={() => updateGoal(waterGoal + 0.5)}>+</button>
              </div>
            </div>
          </div>
        </div>

        <div className="sleep-card">
          <h3 className="card-title">🌙 Sleep Tracker</h3>
          
          {currentSleep > 0 ? (
            <SleepStages 
              total={currentSleep}
              goal={sleepGoal}
              rem={currentRem}
              deep={currentDeep}
              light={currentLight}
            />
          ) : (
            <div className="sleep-empty">
              <p>No sleep data logged yet</p>
            </div>
          )}
          
          <div className="sleep-form">
            <div className="form-hint">
              💡 Import data from your fitness band or smartwatch
            </div>
            
            <input 
              type="number" 
              step="0.1" 
              min="0" 
              max="24"
              placeholder="Total sleep (hours)" 
              value={sleepInput} 
              onChange={(e) => setSleepInput(e.target.value)}
            />
            
            <div className="sleep-stages-input">
              <input 
                type="number" 
                step="0.1" 
                min="0"
                placeholder="REM sleep (h)" 
                value={remSleep} 
                onChange={(e) => setRemSleep(e.target.value)}
              />
              <input 
                type="number" 
                step="0.1" 
                min="0"
                placeholder="Deep sleep (h)" 
                value={deepSleep} 
                onChange={(e) => setDeepSleep(e.target.value)}
              />
              <input 
                type="number" 
                step="0.1" 
                min="0"
                placeholder="Light sleep (h)" 
                value={lightSleep} 
                onChange={(e) => setLightSleep(e.target.value)}
              />
            </div>
            
            <textarea 
              placeholder="Notes (optional)" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)}
              rows="2"
            />
            
            <div className="goal-setter">
              <label>Sleep Goal (6-10h):</label>
              <div className="goal-input-group">
                <button onClick={() => updateSleepGoal(sleepGoal - 0.5)}>−</button>
                <input 
                  type="number" 
                  min="6" 
                  max="10" 
                  step="0.5"
                  value={sleepGoal} 
                  onChange={(e) => updateSleepGoal(parseFloat(e.target.value))}
                />
                <button onClick={() => updateSleepGoal(sleepGoal + 0.5)}>+</button>
              </div>
            </div>
            
            <button className="save-btn" onClick={saveSleep}>Save Sleep Data</button>
          </div>
        </div>
      </div>

      <div className="history-section">
        <h3 className="section-title">History</h3>
        <div className="history-list">
          {stats.slice().reverse().map((s) => (
            <div key={s.id} className="history-item">
              <div className="history-date">{new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
              <div className="history-details">
                <span className="history-water">💧 {s.waterLiters ?? '-'} / {s.waterGoalLiters ?? '-'} L</span>
                <span className="history-sleep">
                  🌙 {s.sleepHours ?? '-'} / {s.sleepGoalHours ?? '-'} h
                  {s.remSleepHours || s.deepSleepHours || s.lightSleepHours ? (
                    <span className="history-sleep-stages">
                      {' '}(R: {s.remSleepHours?.toFixed(1) ?? '-'}, D: {s.deepSleepHours?.toFixed(1) ?? '-'}, L: {s.lightSleepHours?.toFixed(1) ?? '-'})
                    </span>
                  ) : null}
                </span>
              </div>
              {s.notes && <div className="history-notes">{s.notes}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
