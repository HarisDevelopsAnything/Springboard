import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiShield, FiMail, FiLock, FiLogIn } from 'react-icons/fi';
import '../auth/Auth.css';

const AdminLogin = () => {
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
        // Check if user is admin
        if (result.data.role === 'ROLE_ADMIN') {
          toast.success('Welcome Admin! 🛡️');
          navigate('/admin/dashboard');
        } else {
          toast.error('Access denied. Admin credentials required.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      } else {
        toast.error(result.message || 'Login failed');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid credentials';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <FiShield className="auth-logo" style={{ color: '#dc3545' }} />
          <h1>WellNest Admin</h1>
          <p>Administrative Access Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <h2>Admin Sign In</h2>

          <div className="form-group">
            <label htmlFor="username">
              <FiMail /> Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter admin username"
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
              placeholder="Enter admin password"
              required
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? (
              <span className="btn-loading">Signing in...</span>
            ) : (
              <>
                <FiLogIn /> Admin Sign In
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>Admin access only. Unauthorized access is prohibited.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
