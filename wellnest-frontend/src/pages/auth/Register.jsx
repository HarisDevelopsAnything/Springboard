import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthService from '../../services/authService';
import { toast } from 'react-toastify';
import {
  FiHeart,
  FiUser,
  FiMail,
  FiLock,
  FiUserPlus,
  FiEdit3,
  FiShield,
  FiArrowLeft,
} from 'react-icons/fi';
import './Auth.css';

const Register = () => {
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'USER',
  });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    // Auto-focus next input
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const focusIndex = Math.min(pasted.length, 5);
    otpRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const result = await AuthService.register(registerData);
      if (result.success) {
        toast.success('OTP sent to your email! 📧');
        setStep('verify');
        setResendTimer(60);
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const result = await verifyEmail({ email: formData.email, otp: otpString });
      if (result.success) {
        toast.success('Email verified! Welcome to WellNest! 🎉');
        navigate('/profile');
      } else {
        toast.error(result.message || 'Verification failed');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      await AuthService.resendOtp(formData.email);
      toast.success('New OTP sent! 📧');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    }
  };

  // OTP Verification Screen
  if (step === 'verify') {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <FiShield className="auth-logo" />
            <h1>Verify Email</h1>
            <p>We sent a 6-digit OTP to</p>
            <p className="otp-email">{formData.email}</p>
          </div>

          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="otp-input-group" onPaste={handleOtpPaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(index, e)}
                  className="otp-input"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="btn-loading">Verifying...</span>
              ) : (
                <>
                  <FiShield /> Verify & Continue
                </>
              )}
            </button>
          </form>

          <div className="otp-actions">
            <button
              className="btn-link"
              onClick={handleResendOtp}
              disabled={resendTimer > 0}
            >
              {resendTimer > 0
                ? `Resend OTP in ${resendTimer}s`
                : 'Resend OTP'}
            </button>
            <button
              className="btn-link"
              onClick={() => { setStep('register'); setOtp(['', '', '', '', '', '']); }}
            >
              <FiArrowLeft /> Back to Registration
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <FiHeart className="auth-logo" />
          <h1>WellNest</h1>
          <p>Start your fitness journey today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Create Account</h2>

          <div className="form-group">
            <label htmlFor="fullName">
              <FiEdit3 /> Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="username">
              <FiUser /> Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">
              <FiMail /> Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FiLock /> Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password (min 6 chars)"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">
              <FiLock /> Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="role">
              <FiUser /> I am a
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="USER">Fitness Enthusiast (User)</option>
              <option value="TRAINER">Certified Trainer</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="btn-loading">Creating account...</span>
            ) : (
              <>
                <FiUserPlus /> Create Account
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
