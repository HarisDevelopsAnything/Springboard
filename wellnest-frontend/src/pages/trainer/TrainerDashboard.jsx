import { useState, useEffect } from 'react';
import TrainerService from '../../services/trainerService';
import weightService from '../../services/weightService';
import {
  Users,
  Droplets,
  Flame,
  Moon,
  Dumbbell,
  TrendingUp,
  ChevronRight,
  X,
  Activity,
} from 'lucide-react';
import './TrainerDashboard.css';

const TrainerDashboard = () => {
  const [trainees, setTrainees] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [traineeStats, setTraineeStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'bmi'
  const [bmiHistory, setBmiHistory] = useState([]);

  useEffect(() => {
    loadTrainees();
  }, []);

  useEffect(() => {
    if (!selectedTrainee?.id) return;

    loadTraineeStats(selectedTrainee.id);
    loadTraineeBMI(selectedTrainee.id);

    const statsInterval = setInterval(() => {
      loadTraineeStats(selectedTrainee.id);
    }, 10000);

    const bmiInterval = setInterval(() => {
      loadTraineeBMI(selectedTrainee.id);
    }, 30000);

    return () => {
      clearInterval(statsInterval);
      clearInterval(bmiInterval);
    };
  }, [selectedTrainee?.id]);

  const loadTrainees = async () => {
    try {
      const result = await TrainerService.getMyTrainees();
      if (result.success) {
        setTrainees(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load trainees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTraineeStats = async (traineeId) => {
    try {
      const result = await TrainerService.getTraineeStats(traineeId);
      if (result.success) {
        setTraineeStats(result.data);
      }
    } catch (error) {
      console.error('Failed to load trainee stats:', error);
    }
  };

  const loadTraineeBMI = async (traineeId) => {
    try {
      const result = await weightService.getWeightHistory(traineeId);
      if (result.success) {
        setBmiHistory(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load BMI history:', error);
    }
  };

  const handleSelectTrainee = (trainee) => {
    setSelectedTrainee(trainee);
    setActiveTab('stats');
    loadTraineeStats(trainee.id);
    loadTraineeBMI(trainee.id);
  };

  const getGoalLabel = (goal) => {
    const labels = {
      WEIGHT_LOSS: '🔥 Weight Loss',
      MUSCLE_GAIN: '💪 Muscle Gain',
      GENERAL_HEALTH: '❤️ General Health',
      ENDURANCE: '🏃 Endurance',
      FLEXIBILITY: '🧘 Flexibility',
    };
    return labels[goal] || goal || '—';
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="spinner"></div>
        <p className="text-text-muted text-sm">Loading your trainees...</p>
      </div>
    );
  }

  return (
    <div className="trainer-dashboard">
      <div className="trainer-glow">
        <div className="orb orb--indigo" />
        <div className="orb orb--cyan" />
      </div>

      <div className="trainer-content">
        <div className="trainer-header">
          <div>
            <h1>My Trainees</h1>
            <p className="subtitle">Monitor trainee progress in real time</p>
          </div>
          <div className="trainer-stats-bar">
            <div className="trainer-stat">
              <Users size={20} />
              <span>{trainees.length} Active</span>
            </div>
          </div>
        </div>

        <div className="trainer-layout">
          {/* Trainee List */}
          <div className="trainee-list">
            {trainees.map((trainee) => (
              <div
                key={trainee.id}
                className={`trainee-card ${selectedTrainee?.id === trainee.id ? 'active' : ''}`}
                onClick={() => handleSelectTrainee(trainee)}
              >
                <div className="trainee-avatar">
                  {trainee.fullName?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="trainee-info">
                  <div className="trainee-name">{trainee.fullName || trainee.username}</div>
                  <div className="trainee-goal">{getGoalLabel(trainee.fitnessGoal)}</div>
                </div>
                <ChevronRight size={18} className="trainee-arrow" />
              </div>
            ))}
            {trainees.length === 0 && (
              <div className="empty-state">
                <Users size={48} />
                <p>No trainees assigned yet</p>
              </div>
            )}
          </div>

          {/* Trainee Details */}
          {selectedTrainee && traineeStats ? (
            <div className="trainee-details">
              <div className="details-header">
                <div>
                  <h2>{selectedTrainee.fullName || selectedTrainee.username}</h2>
                  <p className="details-email">{selectedTrainee.email}</p>
                </div>
                <button className="close-btn" onClick={() => setSelectedTrainee(null)}>
                  <X size={20} />
                </button>
              </div>

              {/* Tabs */}
              <div className="details-tabs">
                <button 
                  className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stats')}
                >
                  <TrendingUp size={18} /> Stats
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'bmi' ? 'active' : ''}`}
                  onClick={() => setActiveTab('bmi')}
                >
                  <Activity size={18} /> BMI Progress
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'stats' && (
                <>
                  {/* Stats Grid */}
                  <div className="stats-grid-trainer">
                    <div className="stat-card-trainer water">
                      <div className="stat-icon"><Droplets size={24} /></div>
                      <div className="stat-content">
                        <div className="stat-label">Water Intake</div>
                        <div className="stat-value">
                          {traineeStats.waterLiters?.toFixed(1) || 0}L / {traineeStats.waterGoalLiters || 3}L
                        </div>
                      </div>
                    </div>

                    <div className="stat-card-trainer calories">
                      <div className="stat-icon"><Flame size={24} /></div>
                      <div className="stat-content">
                        <div className="stat-label">Calories Today</div>
                        <div className="stat-value">{Math.round(traineeStats.totalCalories || 0)} kcal</div>
                      </div>
                    </div>

                    <div className="stat-card-trainer sleep">
                      <div className="stat-icon"><Moon size={24} /></div>
                      <div className="stat-content">
                        <div className="stat-label">Sleep</div>
                        <div className="stat-value">
                          {traineeStats.sleepHours?.toFixed(1) || 0}h / {traineeStats.sleepGoalHours || 8}h
                        </div>
                      </div>
                    </div>

                    <div className="stat-card-trainer workouts">
                      <div className="stat-icon"><Dumbbell size={24} /></div>
                      <div className="stat-content">
                        <div className="stat-label">Workouts This Week</div>
                        <div className="stat-value">{traineeStats.workoutsThisWeek || 0}</div>
                      </div>
                    </div>

                    <div className="stat-card-trainer meals">
                      <div className="stat-icon"><TrendingUp size={24} /></div>
                      <div className="stat-content">
                        <div className="stat-label">Meals Logged Today</div>
                        <div className="stat-value">{traineeStats.mealsLoggedToday || 0}</div>
                      </div>
                    </div>
                  </div>

                </>
              )}

              {activeTab === 'bmi' && (
                <div className="bmi-progress-section">
                  <h3><Activity size={20} /> BMI Progress</h3>
                  {bmiHistory.length > 0 ? (
                    <>
                      <div className="bmi-current-stats">
                        <div className="bmi-stat">
                          <label>Current Weight:</label>
                          <span>{bmiHistory[0]?.weight || 'N/A'} kg</span>
                        </div>
                        <div className="bmi-stat">
                          <label>Current BMI:</label>
                          <span>{bmiHistory[0]?.bmi?.toFixed(1) || 'N/A'}</span>
                        </div>
                        <div className="bmi-stat">
                          <label>Category:</label>
                          <span className={`bmi-category ${bmiHistory[0]?.bmiCategory?.toLowerCase()}`}>
                            {bmiHistory[0]?.bmiCategory || 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="bmi-chart">
                        <svg viewBox="0 0 600 300" className="chart-svg">
                          <defs>
                            <linearGradient id="bmiGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#667eea" stopOpacity="0.5"/>
                              <stop offset="100%" stopColor="#764ba2" stopOpacity="0.1"/>
                            </linearGradient>
                          </defs>
                          
                          {(() => {
                            const data = [...bmiHistory].reverse().slice(-30);
                            if (data.length === 0) return null;

                            const maxBmi = Math.max(...data.map(d => d.bmi || 0)) + 2;
                            const minBmi = Math.min(...data.map(d => d.bmi || 0)) - 2;
                            
                            const points = data.map((entry, index) => {
                              const x = 50 + (index * (500 / Math.max(data.length - 1, 1)));
                              const y = 250 - ((entry.bmi - minBmi) / (maxBmi - minBmi)) * 200;
                              return { x, y, bmi: entry.bmi };
                            });

                            const pathData = points.map((p, i) => 
                              `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
                            ).join(' ');

                            const areaPath = `${pathData} L ${points[points.length - 1].x} 250 L 50 250 Z`;

                            return (
                              <>
                                <path d={areaPath} fill="url(#bmiGradient)" />
                                <path d={pathData} fill="none" stroke="#667eea" strokeWidth="3" />
                                {points.map((p, i) => (
                                  <circle key={i} cx={p.x} cy={p.y} r="4" fill="#764ba2" />
                                ))}
                                <text x="300" y="20" textAnchor="middle" fill="#1e293b" fontWeight="bold">
                                  BMI Trend (Last {data.length} Entries)
                                </text>
                              </>
                            );
                          })()}
                        </svg>
                      </div>

                      <div className="bmi-history-list">
                        <h4>Recent Entries</h4>
                        {bmiHistory.slice(0, 10).map((entry, index) => (
                          <div key={index} className="bmi-entry">
                            <div className="entry-date">
                              {new Date(entry.date).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                            <div className="entry-details">
                              <span>{entry.weight} kg</span>
                              <span>BMI: {entry.bmi?.toFixed(1)}</span>
                              <span className={`bmi-badge ${entry.bmiCategory?.toLowerCase()}`}>
                                {entry.bmiCategory}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="empty-bmi-state">
                      <Activity size={48} />
                      <p>No BMI data available yet</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="trainee-details empty">
              <div className="select-prompt">
                <Users size={64} />
                <p>Select a trainee to view their stats and BMI progress</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
