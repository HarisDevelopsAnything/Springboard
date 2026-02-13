import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiHeart, FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await login(formData);
      if (result.success) {
        toast.success('Welcome back! 💪');
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message || '';

      if (status === 403 && message.includes('Email not verified')) {
        toast.warning('Please verify your email first. A new OTP has been sent.');
        // Could navigate to a verify page, but user should check email
      } else {
        toast.error(message || 'Invalid username or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <FiHeart className="auth-logo" />
          <h1>WellNest</h1>
          <p>Smart Health & Fitness Companion</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Sign In</h2>

          <div className="form-group">
            <label htmlFor="username">
              <FiMail /> Username or Email
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username or email"
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
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="forgot-password-link">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="btn-loading">Signing in...</span>
            ) : (
              <>
                <FiLogIn /> Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account? <Link to="/register">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
