import { useState, useEffect } from 'react';
import TrainerService from '../../services/trainerService';
import {
  Users,
  Droplets,
  Flame,
  Moon,
  Dumbbell,
  Send,
  MessageCircle,
  TrendingUp,
  ChevronRight,
  X,
} from 'lucide-react';
import './TrainerDashboard.css';

const TrainerDashboard = () => {
  const [trainees, setTrainees] = useState([]);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [traineeStats, setTraineeStats] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

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

  const handleSelectTrainee = (trainee) => {
    setSelectedTrainee(trainee);
    loadTraineeStats(trainee.id);
    setMessage('');
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedTrainee) return;
    
    setSending(true);
    try {
      const result = await TrainerService.sendMessage(selectedTrainee.id, message);
      if (result.success) {
        setMessage('');
        alert('Message sent successfully!');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
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
            <p className="subtitle">Monitor progress and send messages</p>
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

              {/* Message Section */}
              <div className="message-section">
                <h3><MessageCircle size={20} /> Send Message</h3>
                <textarea
                  placeholder="Write a motivational message or guidance for your trainee..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                />
                <button 
                  className="send-message-btn" 
                  onClick={handleSendMessage}
                  disabled={sending || !message.trim()}
                >
                  <Send size={18} />
                  {sending ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </div>
          ) : (
            <div className="trainee-details empty">
              <div className="select-prompt">
                <Users size={64} />
                <p>Select a trainee to view their stats and send messages</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerDashboard;
