import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthService from '../../services/authService';
import { toast } from 'react-toastify';
import {
  FiHeart,
  FiMail,
  FiLock,
  FiShield,
  FiArrowLeft,
  FiCheck,
} from 'react-icons/fi';
import './Auth.css';

const ForgotPassword = () => {
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset' | 'done'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [passwords, setPasswords] = useState({ newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const navigate = useNavigate();
  const otpRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await AuthService.forgotPassword(email);
      if (result.success) {
        toast.success('OTP sent to your email! 📧');
        setStep('otp');
        setResendTimer(60);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
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

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter the 6-digit OTP');
      return;
    }
    // Move to password reset step
    setStep('reset');
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (passwords.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.resetPassword({
        email,
        otp: otp.join(''),
        newPassword: passwords.newPassword,
      });
      if (result.success) {
        toast.success('Password reset successful! 🎉');
        setStep('done');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    try {
      await AuthService.forgotPassword(email);
      toast.success('New OTP sent! 📧');
      setResendTimer(60);
      setOtp(['', '', '', '', '', '']);
    } catch (error) {
      toast.error('Failed to resend OTP');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <FiHeart className="auth-logo" />
          <h1>WellNest</h1>
          <p>
            {step === 'done'
              ? 'All set!'
              : 'Reset your password'}
          </p>
        </div>

        {/* Step 1: Enter Email */}
        {step === 'email' && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <h2>Forgot Password</h2>
            <p className="form-subtitle">
              Enter your registered email and we'll send you an OTP to reset your password.
            </p>

            <div className="form-group">
              <label htmlFor="email">
                <FiMail /> Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="btn-loading">Sending OTP...</span>
              ) : (
                <>
                  <FiMail /> Send OTP
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 2: Enter OTP */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyAndReset} className="auth-form">
            <h2>Enter OTP</h2>
            <p className="form-subtitle">
              We sent a 6-digit code to <strong className="otp-email-inline">{email}</strong>
            </p>

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
              <FiShield /> Verify OTP
            </button>

            <div className="otp-actions">
              <button
                type="button"
                className="btn-link"
                onClick={handleResendOtp}
                disabled={resendTimer > 0}
              >
                {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <h2>New Password</h2>
            <p className="form-subtitle">Create a strong new password for your account.</p>

            <div className="form-group">
              <label htmlFor="newPassword">
                <FiLock /> New Password
              </label>
              <input
                type="password"
                id="newPassword"
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                placeholder="Enter new password (min 6 chars)"
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
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
                required
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? (
                <span className="btn-loading">Resetting...</span>
              ) : (
                <>
                  <FiLock /> Reset Password
                </>
              )}
            </button>
          </form>
        )}

        {/* Step 4: Success */}
        {step === 'done' && (
          <div className="auth-form success-state">
            <div className="success-icon">
              <FiCheck />
            </div>
            <h2>Password Reset!</h2>
            <p className="form-subtitle">
              Your password has been reset successfully. You can now sign in with your new password.
            </p>
            <button
              className="btn-primary"
              onClick={() => navigate('/login')}
            >
              <FiArrowLeft /> Go to Sign In
            </button>
          </div>
        )}

        <div className="auth-footer">
          <p>
            Remember your password? <Link to="/login">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
