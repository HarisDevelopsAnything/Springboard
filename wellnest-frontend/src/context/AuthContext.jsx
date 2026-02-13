import { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = AuthService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const result = await AuthService.login(credentials);
    if (result.success) {
      setUser(result.data);
    }
    return result;
  };

  const register = async (data) => {
    // Registration now only sends OTP, does not auto-login
    const result = await AuthService.register(data);
    return result;
  };

  const verifyEmail = async (data) => {
    const result = await AuthService.verifyEmail(data);
    if (result.success) {
      setUser(result.data);
    }
    return result;
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    verifyEmail,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
