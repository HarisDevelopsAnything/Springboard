import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHeart,
  FiHome,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX,
} from 'react-icons/fi';
import { useState } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <FiHeart className="brand-icon" />
          <span>WellNest</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <FiX /> : <FiMenu />}
        </button>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link
            to="/dashboard"
            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <FiHome /> Dashboard
          </Link>
          <Link
            to="/profile"
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
            onClick={() => setMenuOpen(false)}
          >
            <FiUser /> Profile
          </Link>

          <div className="nav-user">
            <span className="nav-username">
              {user?.fullName || user?.username}
            </span>
            <span className="nav-role">{user?.role?.replace('ROLE_', '')}</span>
            <button className="btn-logout" onClick={handleLogout}>
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
