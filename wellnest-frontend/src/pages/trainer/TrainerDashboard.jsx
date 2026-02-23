import { useState, useEffect } from 'react';
import TrainerService from '../../services/trainerService';
import {
  Users,
  Target,
  Activity,
  Ruler,
  Weight,
  Calendar,
  User,
  AlertTriangle,
  ClipboardList,
} from 'lucide-react';
import './TrainerDashboard.css';

const TrainerDashboard = () => {
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrainees();
  }, []);

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

  const getActivityLabel = (level) => {
    if (!level) return '—';
    return level.replace(/_/g, ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
  };

  const getBMI = (weight, height) => {
    if (weight && height) {
      const heightM = height / 100;
      return (weight / (heightM * heightM)).toFixed(1);
    }
    return null;
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
      {/* Glow orbs */}
      <div className="trainer-glow">
        <div className="orb orb--indigo" />
        <div className="orb orb--cyan" />
        <div className="orb orb--emerald" />
      </div>

      <div className="trainer-content">
        {/* Header */}
        <div className="trainer-header">
          <div>
            <h1>My Trainees</h1>
            <p className="subtitle">Manage and monitor your trainees' fitness journey</p>
          </div>
          <div className="trainer-stats-bar">
            <div className="trainer-stat">
              <div className="stat-number">{trainees.length}</div>
              <div className="stat-label">Active Trainees</div>
            </div>
            <div className="trainer-stat">
              <div className="stat-number">
                {trainees.filter(t => t.hasProfile).length}
              </div>
              <div className="stat-label">With Profile</div>
            </div>
          </div>
        </div>

        {/* Trainees Grid */}
        {trainees.length === 0 ? (
          <div className="trainer-empty">
            <div className="trainer-empty-icon">
              <Users style={{ width: 36, height: 36, color: '#818cf8' }} />
            </div>
            <h3>No trainees yet</h3>
            <p>
              When trainees select you as their trainer, they'll appear here with their fitness
              profile and health data.
            </p>
          </div>
        ) : (
          <div className="trainees-grid">
            {trainees.map((trainee) => {
              const bmi = getBMI(trainee.weight, trainee.height);
              return (
                <div key={trainee.id} className="trainee-card">
                  {/* Card Header */}
                  <div className="trainee-card-header">
                    <div className="trainee-avatar">
                      {trainee.fullName?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="trainee-name">{trainee.fullName || trainee.username}</p>
                      <p className="trainee-email">{trainee.email}</p>
                    </div>
                    <span className="trainee-date-badge">
                      <Calendar style={{ width: 10, height: 10, display: 'inline', marginRight: 3, verticalAlign: 'middle' }} />
                      {trainee.assignmentDate}
                    </span>
                  </div>

                  {/* Card Body */}
                  {trainee.hasProfile ? (
                    <>
                      <div className="trainee-stats">
                        <div className="trainee-stat-item">
                          <div className="trainee-stat-icon" style={{ background: 'rgba(78, 204, 163, 0.15)' }}>
                            <Target style={{ width: 16, height: 16, color: '#4ecca3' }} />
                          </div>
                          <div>
                            <div className="label">Goal</div>
                            <div className="value">{getGoalLabel(trainee.fitnessGoal)}</div>
                          </div>
                        </div>

                        <div className="trainee-stat-item">
                          <div className="trainee-stat-icon" style={{ background: 'rgba(167, 139, 250, 0.15)' }}>
                            <Activity style={{ width: 16, height: 16, color: '#a78bfa' }} />
                          </div>
                          <div>
                            <div className="label">Activity</div>
                            <div className="value">{getActivityLabel(trainee.activityLevel)}</div>
                          </div>
                        </div>

                        <div className="trainee-stat-item">
                          <div className="trainee-stat-icon" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
                            <Weight style={{ width: 16, height: 16, color: '#fbbf24' }} />
                          </div>
                          <div>
                            <div className="label">Weight</div>
                            <div className="value">{trainee.weight ? `${trainee.weight} kg` : '—'}</div>
                          </div>
                        </div>

                        <div className="trainee-stat-item">
                          <div className="trainee-stat-icon" style={{ background: 'rgba(34, 211, 238, 0.15)' }}>
                            <Ruler style={{ width: 16, height: 16, color: '#22d3ee' }} />
                          </div>
                          <div>
                            <div className="label">Height</div>
                            <div className="value">{trainee.height ? `${trainee.height} cm` : '—'}</div>
                          </div>
                        </div>

                        {trainee.age && (
                          <div className="trainee-stat-item">
                            <div className="trainee-stat-icon" style={{ background: 'rgba(244, 114, 182, 0.15)' }}>
                              <User style={{ width: 16, height: 16, color: '#f472b6' }} />
                            </div>
                            <div>
                              <div className="label">Age</div>
                              <div className="value">{trainee.age} yrs</div>
                            </div>
                          </div>
                        )}

                        {bmi && (
                          <div className="trainee-stat-item">
                            <div className="trainee-stat-icon" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                              <ClipboardList style={{ width: 16, height: 16, color: '#818cf8' }} />
                            </div>
                            <div>
                              <div className="label">BMI</div>
                              <div className="value">{bmi}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {trainee.medicalNotes && (
                        <div className="trainee-notes">
                          <div className="notes-label">Medical Notes</div>
                          <div className="notes-text">{trainee.medicalNotes}</div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="trainee-no-profile">
                      <AlertTriangle style={{ width: 18, height: 18, color: '#fbbf24', flexShrink: 0 }} />
                      <p>This trainee hasn't set up their fitness profile yet.</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainerDashboard;
