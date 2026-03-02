import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileService from '../../services/profileService';
import TrainerService from '../../services/trainerService';
import trackerService from '../../services/trackerService';
import ReportModal from '../../components/ReportModal';
import WaterWave from '../../components/WaterWave';
import NutrientBars from '../../components/NutrientBars';
import SleepStages from '../../components/SleepStages';
import WorkoutCircle from '../../components/WorkoutCircle';
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
  AlertCircle,
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const isTrainer = user?.role === 'ROLE_TRAINER';
  const isCustomer = user?.role === 'ROLE_USER';
  const [profile, setProfile] = useState(null);
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [todayWater, setTodayWater] = useState({ current: 0, goal: 3 });
  const [todaySleep, setTodaySleep] = useState({ total: 0, goal: 8, rem: 0, deep: 0, light: 0 });
  const [todayNutrients, setTodayNutrients] = useState({ protein: 0, carbs: 0, fats: 0, calories: 0 });
  const [todayWorkouts, setTodayWorkouts] = useState([]);

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
      const today = new Date().toISOString().slice(0, 10);
      
      // Fetch today's water stats
      const statsResult = await trackerService.listDailyStats();
      const stats = statsResult.data || [];
      const todayStat = stats.find(s => s.date === today);
      if (todayStat) {
        setTodayWater({
          current: todayStat.waterLiters || 0,
          goal: todayStat.waterGoalLiters || 3
        });
        setTodaySleep({
          total: todayStat.sleepHours || 0,
          goal: todayStat.sleepGoalHours || 8,
          rem: todayStat.remSleepHours || 0,
          deep: todayStat.deepSleepHours || 0,
          light: todayStat.lightSleepHours || 0
        });
      }
      
      // Fetch today's meals
      const mealsResult = await trackerService.listMeals();
      const meals = mealsResult.data || [];
      const todayMeals = meals.filter(m => m.date === today);
      const totals = todayMeals.reduce((acc, meal) => ({
        protein: acc.protein + (meal.protein || 0),
        carbs: acc.carbs + (meal.carbs || 0),
        fats: acc.fats + (meal.fats || 0),
        calories: acc.calories + (meal.calories || 0)
      }), { protein: 0, carbs: 0, fats: 0, calories: 0 });
      setTodayNutrients(totals);

      // Fetch today's workouts
      const workoutsResult = await trackerService.listWorkouts();
      const workouts = workoutsResult.data || [];
      const todayWorkoutsFiltered = workouts.filter(w => w.date === today);
      setTodayWorkouts(todayWorkoutsFiltered);
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
      path: '/tracker/workouts',
    },
    {
      icon: UtensilsCrossed,
      title: 'Meal Tracker',
      desc: 'Record meals, calories, and nutritional breakdown.',
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      week: 'Week 3',
      path: '/tracker/meals',
    },
    {
      icon: Moon,
      title: 'Sleep Log',
      desc: 'Monitor sleep duration and quality patterns.',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      week: 'Week 4',
      path: '/tracker/daily-stats',
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

        {/* Nutrition Card */}
        <div>
          <h2 className="section-title">Today's Nutrition</h2>
          <Link to="/tracker/meals" className="nutrition-dashboard-card">
            <div className="nutrition-dashboard-header">
              <UtensilsCrossed style={{ width: 24, height: 24, color: '#f59e0b' }} />
              <h3>Meal Tracker</h3>
              <span className="nutrition-calories">{todayNutrients.calories} kcal</span>
            </div>
            <NutrientBars 
              protein={todayNutrients.protein} 
              carbs={todayNutrients.carbs} 
              fats={todayNutrients.fats} 
              compact 
            />
          </Link>
        </div>

        {/* Water Intake Card */}
        <div>
          <h2 className="section-title">Today's Hydration</h2>
          <Link to="/tracker/daily-stats" className="water-dashboard-card">
            <div className="water-dashboard-header">
              <Droplets style={{ width: 24, height: 24, color: '#60a5fa' }} />
              <h3>Water Intake</h3>
            </div>
            <WaterWave current={todayWater.current} goal={todayWater.goal} compact />
          </Link>
        </div>

        {/* Sleep Card */}
        <div>
          <h2 className="section-title">Today's Sleep</h2>
          <Link to="/tracker/daily-stats" className="sleep-dashboard-card">
            <div className="sleep-dashboard-header">
              <Moon style={{ width: 24, height: 24, color: '#c084fc' }} />
              <h3>Sleep Quality</h3>
            </div>
            {todaySleep.total > 0 ? (
              <SleepStages 
                total={todaySleep.total}
                goal={todaySleep.goal}
                rem={todaySleep.rem}
                deep={todaySleep.deep}
                light={todaySleep.light}
                compact
              />
            ) : (
              <div className="dashboard-empty-state">
                <p>No sleep data logged yet</p>
                <span className="dashboard-empty-hint">Tap to add from your fitness band</span>
              </div>
            )}
          </Link>
        </div>

        {/* Workout Card */}
        <div>
          <h2 className="section-title">Today's Workout</h2>
          <Link to="/tracker/workouts" className="workout-dashboard-card">
            <div className="workout-dashboard-header">
              <Dumbbell style={{ width: 24, height: 24, color: '#ef4444' }} />
              <h3>Activity</h3>
            </div>
            {todayWorkouts.length > 0 ? (
              <WorkoutCircle workouts={todayWorkouts} calorieGoal={500} compact />
            ) : (
              <div className="dashboard-empty-state">
                <p>No workouts logged yet</p>
                <span className="dashboard-empty-hint">Tap to start tracking</span>
              </div>
            )}
          </Link>
        </div>

        {/* Feature Cards */}
        

        {/* Report Trainer Button - Only for Customers */}
        {isCustomer && (
          <div className="report-section">
            <button 
              className="report-trainer-btn" 
              onClick={() => setShowReportModal(true)}
            >
              <AlertCircle style={{ width: 20, height: 20 }} />
              Report a Trainer
            </button>
            <p className="report-info">
              Having issues with a trainer? Let us know so we can review your concern.
            </p>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {isCustomer && (
        <ReportModal 
          isOpen={showReportModal} 
          onClose={() => setShowReportModal(false)} 
        />
      )}
    </div>
  );
};

export default Dashboard;
