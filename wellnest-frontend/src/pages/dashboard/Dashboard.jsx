import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileService from '../../services/profileService';
import TrainerService from '../../services/trainerService';
import './Dashboard.css';
import {
  Activity,
  Target,
  Droplets,
  Moon,
  TrendingUp,
  User,
  ArrowRight,
  Dumbbell,
  UtensilsCrossed,
  Calendar,
  Users,
  Bell,
  MessageSquare,
  ClipboardList,
  BarChart3,
  Heart,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const isTrainer = user?.role === 'ROLE_TRAINER';
  const [profile, setProfile] = useState(null);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isTrainer) {
      loadTrainerData();
    } else {
      loadProfile();
    }
  }, []);

  const loadProfile = async () => {
    try {
      const result = await ProfileService.getProfile();
      if (result.success) {
        setProfile(result.data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrainerData = async () => {
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getGoalLabel = (goal) => {
    const labels = {
      WEIGHT_LOSS: '🔥 Weight Loss',
      MUSCLE_GAIN: '💪 Muscle Gain',
      GENERAL_HEALTH: '❤️ General Health',
      ENDURANCE: '🏃 Endurance',
      FLEXIBILITY: '🧘 Flexibility',
    };
    return labels[goal] || goal || 'Not set';
  };

  const getBMI = () => {
    const fp = profile?.fitnessProfile;
    if (fp?.weight && fp?.height) {
      const heightM = fp.height / 100;
      const bmi = fp.weight / (heightM * heightM);
      return bmi.toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi) => {
    if (!bmi) return null;
    const val = parseFloat(bmi);
    if (val < 18.5) return { label: 'Underweight', color: 'text-yellow-400' };
    if (val < 25) return { label: 'Normal', color: 'text-accent' };
    if (val < 30) return { label: 'Overweight', color: 'text-orange-400' };
    return { label: 'Obese', color: 'text-red-400' };
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="spinner"></div>
        <p className="text-text-muted text-sm">Loading dashboard...</p>
      </div>
    );
  }

  const bmi = getBMI();
  const bmiCategory = getBMICategory(bmi);
  const fitnessProfile = profile?.fitnessProfile;
  const hasProfile = !!fitnessProfile;

  // ─── TRAINER DASHBOARD ───────────────────────────────────────────
  if (isTrainer) {
    const withProfile = trainees.filter(t => t.hasProfile).length;
    return (
      <div className="dashboard-wrapper">
        <div className="dashboard-glow">
          <div className="orb orb--green" />
          <div className="orb orb--purple" />
          <div className="orb orb--teal" />
          <div className="orb orb--pink" />
          <div className="orb orb--amber" />
        </div>

        <div className="dashboard-content">
          {/* Welcome */}
          <div className="welcome-section">
            <div>
              <h1>
                {getGreeting()},{' '}
                <span>{user?.fullName?.split(' ')[0] || user?.username}</span>!
              </h1>
              <p className="subtitle">Here's your training overview</p>
            </div>
            <div className="welcome-date">
              <Calendar className="w-4 h-4" />
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="card-inner">
                <div className="icon-box" style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                  <Users style={{ width: 22, height: 22, color: '#818cf8' }} />
                </div>
                <div>
                  <p className="stat-label">Active Trainees</p>
                  <p className="stat-value">{trainees.length}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="card-inner">
                <div className="icon-box" style={{ background: 'rgba(78, 204, 163, 0.15)' }}>
                  <ClipboardList style={{ width: 22, height: 22, color: '#4ecca3' }} />
                </div>
                <div>
                  <p className="stat-label">Profiles Complete</p>
                  <p className="stat-value">{withProfile} / {trainees.length}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="card-inner">
                <div className="icon-box" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
                  <Calendar style={{ width: 22, height: 22, color: '#fbbf24' }} />
                </div>
                <div>
                  <p className="stat-label">Today's Date</p>
                  <p className="stat-value">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                </div>
              </div>
            </div>
            <div className="stat-card">
              <div className="card-inner">
                <div className="icon-box" style={{ background: 'rgba(244, 114, 182, 0.15)' }}>
                  <Heart style={{ width: 22, height: 22, color: '#f472b6' }} />
                </div>
                <div>
                  <p className="stat-label">Avg. Goal</p>
                  <p className="stat-value" style={{ fontSize: '0.85rem' }}>
                    {trainees.length > 0
                      ? (() => {
                          const goals = trainees.filter(t => t.fitnessGoal).map(t => t.fitnessGoal);
                          if (goals.length === 0) return '—';
                          const counts = {};
                          goals.forEach(g => { counts[g] = (counts[g] || 0) + 1; });
                          const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
                          return top.replace('_', ' ').toLowerCase().replace(/^\w/, c => c.toUpperCase());
                        })()
                      : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Placeholder Sections */}
          <div className="trainer-placeholder-grid">
            <div className="placeholder-card placeholder-card--large">
              <div className="placeholder-card-header">
                <div className="placeholder-icon" style={{ background: 'rgba(251, 191, 36, 0.15)' }}>
                  <Bell style={{ width: 20, height: 20, color: '#fbbf24' }} />
                </div>
                <h3>Alerts &amp; Notifications</h3>
              </div>
              <div className="placeholder-body">
                <p>Trainee alerts, missed sessions, and important updates will appear here.</p>
                <span className="coming-badge">Coming Soon</span>
              </div>
            </div>

            <div className="placeholder-card">
              <div className="placeholder-card-header">
                <div className="placeholder-icon" style={{ background: 'rgba(34, 211, 238, 0.15)' }}>
                  <MessageSquare style={{ width: 20, height: 20, color: '#22d3ee' }} />
                </div>
                <h3>Messages</h3>
              </div>
              <div className="placeholder-body">
                <p>Chat with your trainees and respond to queries.</p>
                <span className="coming-badge">Coming Soon</span>
              </div>
            </div>

            <div className="placeholder-card">
              <div className="placeholder-card-header">
                <div className="placeholder-icon" style={{ background: 'rgba(167, 139, 250, 0.15)' }}>
                  <BarChart3 style={{ width: 20, height: 20, color: '#a78bfa' }} />
                </div>
                <h3>Trainee Progress</h3>
              </div>
              <div className="placeholder-body">
                <p>Track your trainees' workout streaks and weight trends.</p>
                <span className="coming-badge">Coming Soon</span>
              </div>
            </div>

            <div className="placeholder-card">
              <div className="placeholder-card-header">
                <div className="placeholder-icon" style={{ background: 'rgba(78, 204, 163, 0.15)' }}>
                  <Target style={{ width: 20, height: 20, color: '#4ecca3' }} />
                </div>
                <h3>Goal Assignments</h3>
              </div>
              <div className="placeholder-body">
                <p>Set custom fitness goals and meal plans for each trainee.</p>
                <span className="coming-badge">Coming Soon</span>
              </div>
            </div>

            <div className="placeholder-card">
              <div className="placeholder-card-header">
                <div className="placeholder-icon" style={{ background: 'rgba(244, 114, 182, 0.15)' }}>
                  <Activity style={{ width: 20, height: 20, color: '#f472b6' }} />
                </div>
                <h3>Session Scheduler</h3>
              </div>
              <div className="placeholder-body">
                <p>Schedule and manage training sessions with your trainees.</p>
                <span className="coming-badge">Coming Soon</span>
              </div>
            </div>
          </div>

          {/* Quick link to My Trainees */}
          <Link to="/trainer-dashboard" className="view-trainees-link">
            <Users style={{ width: 18, height: 18 }} />
            View all trainees &amp; their data
            <ArrowRight style={{ width: 16, height: 16 }} />
          </Link>
        </div>
      </div>
    );
  }

  // ─── USER DASHBOARD ─────────────────────────────────────────────

  const featureCards = [
    {
      icon: Dumbbell,
      title: 'Workout Tracker',
      desc: 'Log your daily workouts and track exercise progress.',
      color: 'text-red-400',
      bg: 'bg-red-500/10',
      week: 'Week 3',
    },
    {
      icon: UtensilsCrossed,
      title: 'Meal Tracker',
      desc: 'Record meals, calories, and nutritional breakdown.',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      week: 'Week 3',
    },
    {
      icon: Droplets,
      title: 'Water Intake',
      desc: 'Track your daily water consumption easily.',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      week: 'Week 4',
    },
    {
      icon: Moon,
      title: 'Sleep Log',
      desc: 'Monitor sleep duration and quality patterns.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      week: 'Week 4',
    },
  ];

  return (
    <div className="dashboard-wrapper">
      {/* Ambient glow orbs — fixed to viewport */}
      <div className="dashboard-glow">
        <div className="orb orb--green" />
        <div className="orb orb--purple" />
        <div className="orb orb--teal" />
        <div className="orb orb--pink" />
        <div className="orb orb--amber" />
      </div>

      <div className="dashboard-content">
        {/* Welcome Section */}
        <div className="welcome-section">
          <div>
            <h1>
              {getGreeting()},{' '}
              <span>{user?.fullName?.split(' ')[0] || user?.username}</span>!
            </h1>
            <p className="subtitle">
              Here's your health &amp; fitness overview
            </p>
          </div>
          <div className="welcome-date">
            <Calendar className="w-4 h-4" />
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </div>
        </div>

        {/* Profile Completion Alert */}
        {!hasProfile && (
          <div className="profile-alert">
            <div className="alert-icon-box">
              <User className="w-5 h-5 text-accent" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <h3>Complete Your Fitness Profile</h3>
              <p>Set up your fitness profile to get personalized recommendations.</p>
            </div>
            <Link to="/profile" className="btn-setup">
              Set Up Profile <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* Stats Grid */}
        <div className="stats-grid">
          {[
            { label: 'Fitness Goal', value: getGoalLabel(fitnessProfile?.fitnessGoal), icon: Target, iconColor: '#4ecca3', iconBg: 'rgba(78, 204, 163, 0.15)' },
            { label: 'BMI', value: bmi ? `${bmi}` : 'Set up profile', extra: bmi ? bmiCategory : null, icon: TrendingUp, iconColor: '#a78bfa', iconBg: 'rgba(167, 139, 250, 0.15)' },
            { label: 'Activity Level', value: fitnessProfile?.activityLevel?.replace('_', ' ') || 'Not set', icon: Activity, iconColor: '#22d3ee', iconBg: 'rgba(34, 211, 238, 0.15)' },
            { label: 'Weight', value: fitnessProfile?.weight ? `${fitnessProfile.weight} kg` : 'Not set', icon: User, iconColor: '#fbbf24', iconBg: 'rgba(251, 191, 36, 0.15)' },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="stat-card">
                <div className="card-inner">
                  <div className="icon-box" style={{ background: stat.iconBg }}>
                    <Icon style={{ width: 22, height: 22, color: stat.iconColor }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <p className="stat-label">{stat.label}</p>
                    <p className="stat-value">
                      {stat.value}
                      {stat.extra && (
                        <span style={{ fontSize: '0.75rem', fontWeight: 500, marginLeft: 6, color: stat.extra.color === 'text-accent' ? '#4ecca3' : stat.extra.color === 'text-yellow-400' ? '#fbbf24' : stat.extra.color === 'text-orange-400' ? '#fb923c' : '#f87171' }}>
                          {stat.extra.label}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Feature Cards */}
        <div>
          <h2 className="section-title">Quick Access</h2>
          <div className="feature-grid">
            {featureCards.map((card) => {
              const Icon = card.icon;
              const colorMap = { 'text-red-400': '#f87171', 'text-yellow-400': '#fbbf24', 'text-blue-400': '#60a5fa', 'text-purple-400': '#c084fc' };
              const bgMap = { 'bg-red-500/10': 'rgba(239,68,68,0.1)', 'bg-yellow-500/10': 'rgba(234,179,8,0.1)', 'bg-blue-500/10': 'rgba(59,130,246,0.1)', 'bg-purple-500/10': 'rgba(168,85,247,0.1)' };
              return (
                <div key={card.title} className="feature-card">
                  <div className="feature-icon-box" style={{ background: bgMap[card.bg] || 'rgba(255,255,255,0.05)' }}>
                    <Icon style={{ width: 22, height: 22, color: colorMap[card.color] || '#e0e0e0' }} />
                  </div>
                  <h3>{card.title}</h3>
                  <p>{card.desc}</p>
                  <span className="badge">Coming in {card.week}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
