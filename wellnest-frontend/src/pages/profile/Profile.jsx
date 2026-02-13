import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import ProfileService from '../../services/profileService';
import { toast } from 'react-toastify';
import {
  User,
  Save,
  Activity,
  Target,
  Heart,
  Mail,
  Shield,
  AtSign,
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);
  const [fitnessData, setFitnessData] = useState({
    age: '',
    weight: '',
    height: '',
    gender: '',
    fitnessGoal: '',
    activityLevel: '',
    medicalNotes: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const result = await ProfileService.getProfile();
      if (result.success) {
        setProfile(result.data);
        if (result.data.fitnessProfile) {
          setFitnessData({
            age: result.data.fitnessProfile.age || '',
            weight: result.data.fitnessProfile.weight || '',
            height: result.data.fitnessProfile.height || '',
            gender: result.data.fitnessProfile.gender || '',
            fitnessGoal: result.data.fitnessProfile.fitnessGoal || '',
            activityLevel: result.data.fitnessProfile.activityLevel || '',
            medicalNotes: result.data.fitnessProfile.medicalNotes || '',
          });
        }
      }
    } catch (error) {
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFitnessData({ ...fitnessData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await ProfileService.saveFitnessProfile(fitnessData);
      if (result.success) {
        toast.success('Fitness profile saved! 🎯');
        fetchProfile();
      } else {
        toast.error(result.message || 'Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save fitness profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="spinner"></div>
        <p className="text-text-muted text-sm">Loading profile...</p>
      </div>
    );
  }

  const cardStyle = {
    padding: '1.75rem',
    borderRadius: '1rem',
    background: 'rgba(26, 26, 46, 0.8)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
  };

  const infoItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.85rem 1rem',
    borderRadius: 12,
    background: 'rgba(22, 33, 62, 0.5)',
  };

  const inputStyle = {
    width: '100%',
    padding: '0.7rem 1rem',
    borderRadius: 12,
    background: 'rgba(22, 33, 62, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    color: '#e0e0e0',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.85rem',
    fontWeight: 500,
    color: '#a0a0b8',
    marginBottom: 6,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: 900 }}>
      {/* Account Info Card */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(78, 204, 163, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User style={{ width: 22, height: 22, color: '#4ecca3' }} />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', margin: 0 }}>Account Info</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem' }}>
          {[
            { icon: User, label: 'Full Name', value: profile?.fullName || user?.fullName },
            { icon: AtSign, label: 'Username', value: profile?.username || user?.username },
            { icon: Mail, label: 'Email', value: profile?.email || user?.email },
            { icon: Shield, label: 'Role', value: (profile?.role || user?.role)?.replace('ROLE_', ''), isAccent: true },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} style={infoItemStyle}>
                <Icon style={{ width: 18, height: 18, color: '#808098', flexShrink: 0 }} />
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: '0.7rem', color: '#808098', margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: '0.9rem', fontWeight: 500, color: item.isAccent ? '#4ecca3' : '#fff', margin: 0, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Fitness Profile Form */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: 'rgba(34, 211, 238, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Activity style={{ width: 22, height: 22, color: '#22d3ee' }} />
          </div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#fff', margin: 0 }}>Fitness Profile</h2>
        </div>
        <p style={{ color: '#808098', fontSize: '0.85rem', marginBottom: '1.75rem' }}>
          Help us personalize your experience by completing your fitness profile.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Row: Age + Gender */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor="age" style={labelStyle}>Age</label>
              <input type="number" id="age" name="age" value={fitnessData.age} onChange={handleChange} placeholder="Your age" min="10" max="120" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="gender" style={labelStyle}>Gender</label>
              <select id="gender" name="gender" value={fitnessData.gender} onChange={handleChange} style={inputStyle}>
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Row: Weight + Height */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label htmlFor="weight" style={labelStyle}>Weight (kg)</label>
              <input type="number" id="weight" name="weight" value={fitnessData.weight} onChange={handleChange} placeholder="Weight in kg" step="0.1" min="20" max="300" style={inputStyle} />
            </div>
            <div>
              <label htmlFor="height" style={labelStyle}>Height (cm)</label>
              <input type="number" id="height" name="height" value={fitnessData.height} onChange={handleChange} placeholder="Height in cm" step="0.1" min="50" max="300" style={inputStyle} />
            </div>
          </div>

          {/* Fitness Goal */}
          <div>
            <label htmlFor="fitnessGoal" style={labelStyle}>
              <Target style={{ width: 14, height: 14 }} /> Fitness Goal
            </label>
            <select id="fitnessGoal" name="fitnessGoal" value={fitnessData.fitnessGoal} onChange={handleChange} style={inputStyle}>
              <option value="">Select your goal</option>
              <option value="WEIGHT_LOSS">Weight Loss</option>
              <option value="MUSCLE_GAIN">Muscle Gain</option>
              <option value="GENERAL_HEALTH">General Health</option>
              <option value="ENDURANCE">Endurance</option>
              <option value="FLEXIBILITY">Flexibility</option>
            </select>
          </div>

          {/* Activity Level */}
          <div>
            <label htmlFor="activityLevel" style={labelStyle}>
              <Heart style={{ width: 14, height: 14 }} /> Activity Level
            </label>
            <select id="activityLevel" name="activityLevel" value={fitnessData.activityLevel} onChange={handleChange} style={inputStyle}>
              <option value="">Select activity level</option>
              <option value="SEDENTARY">Sedentary (little/no exercise)</option>
              <option value="LIGHTLY_ACTIVE">Lightly Active (1-3 days/week)</option>
              <option value="MODERATELY_ACTIVE">Moderately Active (3-5 days/week)</option>
              <option value="VERY_ACTIVE">Very Active (6-7 days/week)</option>
            </select>
          </div>

          {/* Medical Notes */}
          <div>
            <label htmlFor="medicalNotes" style={labelStyle}>Medical Notes / Allergies</label>
            <textarea
              id="medicalNotes"
              name="medicalNotes"
              value={fitnessData.medicalNotes}
              onChange={handleChange}
              placeholder="Any medical conditions, allergies, or notes..."
              rows="3"
              style={{ ...inputStyle, resize: 'none' }}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '0.7rem 1.5rem',
              borderRadius: 12,
              background: '#4ecca3',
              color: '#0f0c29',
              fontWeight: 600,
              fontSize: '0.9rem',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.5 : 1,
              transition: 'background 0.2s',
              alignSelf: 'flex-start',
            }}
          >
            {saving ? (
              'Saving...'
            ) : (
              <>
                <Save style={{ width: 18, height: 18 }} /> Save Fitness Profile
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
