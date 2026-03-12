import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import RoleBasedRedirect from './components/RoleBasedRedirect';
import Layout from './components/Layout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/dashboard/Dashboard';
import WorkoutTracker from './pages/tracker/WorkoutTracker';
import MealTracker from './pages/tracker/MealTracker';
import DailyStats from './pages/tracker/DailyStats';
import Profile from './pages/profile/Profile';
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import SelectTrainer from './pages/trainer/SelectTrainer';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import BmiCalculatorPage from './pages/health/BmiCalculatorPage';
import WeightTrackerPage from './pages/health/WeightTrackerPage';
import NotificationsPage from './pages/notifications/NotificationsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/trainer-dashboard" element={<TrainerDashboard />} />
            <Route path="/select-trainer" element={<SelectTrainer />} />
            <Route path="/tracker/workouts" element={<WorkoutTracker />} />
            <Route path="/tracker/meals" element={<MealTracker />} />
            <Route path="/tracker/daily-stats" element={<DailyStats />} />
            <Route path="/bmi-calculator" element={<BmiCalculatorPage />} />
            <Route path="/weight-tracker" element={<WeightTrackerPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Default redirect - role based */}
          <Route path="/" element={<RoleBasedRedirect />} />
          <Route path="*" element={<RoleBasedRedirect />} />
        </Routes>
      </Router>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </AuthProvider>
  );
}

export default App;
