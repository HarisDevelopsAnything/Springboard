import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProfileService from '../../services/profileService';
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
} from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%' }}>
      {/* Welcome Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            {getGreeting()},{' '}
            <span style={{ color: '#4ecca3' }}>
              {user?.fullName?.split(' ')[0] || user?.username}
            </span>
            !
          </h1>
          <p style={{ marginTop: '0.5rem', color: '#a0a0b8', fontSize: '0.95rem' }}>
            Here's your health &amp; fitness overview
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#808098', fontSize: '0.875rem' }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem 1.5rem', borderRadius: '1rem', background: 'rgba(78, 204, 163, 0.1)', border: '1px solid rgba(78, 204, 163, 0.2)', flexWrap: 'wrap' }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(78, 204, 163, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User className="w-5 h-5 text-accent" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>Complete Your Fitness Profile</h3>
            <p style={{ color: '#a0a0b8', fontSize: '0.85rem', marginTop: 4 }}>
              Set up your fitness profile to get personalized recommendations.
            </p>
          </div>
          <Link
            to="/profile"
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 1.2rem', borderRadius: 12, background: '#4ecca3', color: '#0f0c29', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', whiteSpace: 'nowrap' }}
          >
            Set Up Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {[
          { label: 'Fitness Goal', value: getGoalLabel(fitnessProfile?.fitnessGoal), icon: Target, iconColor: '#4ecca3', iconBg: 'rgba(78, 204, 163, 0.15)' },
          { label: 'BMI', value: bmi ? `${bmi}` : 'Set up profile', extra: bmi ? bmiCategory : null, icon: TrendingUp, iconColor: '#a78bfa', iconBg: 'rgba(167, 139, 250, 0.15)' },
          { label: 'Activity Level', value: fitnessProfile?.activityLevel?.replace('_', ' ') || 'Not set', icon: Activity, iconColor: '#22d3ee', iconBg: 'rgba(34, 211, 238, 0.15)' },
          { label: 'Weight', value: fitnessProfile?.weight ? `${fitnessProfile.weight} kg` : 'Not set', icon: User, iconColor: '#fbbf24', iconBg: 'rgba(251, 191, 36, 0.15)' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} style={{ padding: '1.5rem', borderRadius: '1rem', background: 'rgba(26, 26, 46, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', transition: 'border-color 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: stat.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon style={{ width: 22, height: 22, color: stat.iconColor }} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.7rem', color: '#808098', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>{stat.label}</p>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', marginTop: 4 }}>
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
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff', marginBottom: '1.25rem' }}>Quick Access</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {featureCards.map((card) => {
            const Icon = card.icon;
            const colorMap = { 'text-red-400': '#f87171', 'text-yellow-400': '#fbbf24', 'text-blue-400': '#60a5fa', 'text-purple-400': '#c084fc' };
            const bgMap = { 'bg-red-500/10': 'rgba(239,68,68,0.1)', 'bg-yellow-500/10': 'rgba(234,179,8,0.1)', 'bg-blue-500/10': 'rgba(59,130,246,0.1)', 'bg-purple-500/10': 'rgba(168,85,247,0.1)' };
            return (
              <div
                key={card.title}
                style={{ padding: '1.5rem', borderRadius: '1rem', background: 'rgba(26, 26, 46, 0.8)', border: '1px solid rgba(255, 255, 255, 0.1)', transition: 'border-color 0.2s' }}
              >
                <div style={{ width: 48, height: 48, borderRadius: 14, background: bgMap[card.bg] || 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon style={{ width: 22, height: 22, color: colorMap[card.color] || '#e0e0e0' }} />
                </div>
                <h3 style={{ color: '#fff', fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>{card.title}</h3>
                <p style={{ color: '#808098', fontSize: '0.8rem', marginTop: 8, lineHeight: 1.6 }}>
                  {card.desc}
                </p>
                <span style={{ display: 'inline-block', marginTop: 12, fontSize: '0.7rem', padding: '4px 10px', borderRadius: 999, background: 'rgba(42, 58, 92, 0.5)', color: '#808098' }}>
                  Coming in {card.week}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
