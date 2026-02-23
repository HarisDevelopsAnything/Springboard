import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import AdminService from '../../services/adminService.js';
import ReportService from '../../services/reportService.js';
import { 
  FiUsers, FiUserCheck, FiAlertCircle, FiTrash2, 
  FiX, FiRefreshCw, FiBarChart2, FiLogOut 
} from 'react-icons/fi';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsRes, reportsRes] = await Promise.all([
        AdminService.getStats(),
        ReportService.getPendingReports()
      ]);
      
      if (statsRes.success) setStats(statsRes.data);
      if (reportsRes.success) setReports(reportsRes.data);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getAllCustomers();
      if (res.success) setCustomers(res.data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const loadTrainers = async () => {
    setLoading(true);
    try {
      const res = await AdminService.getAllTrainers();
      if (res.success) setTrainers(res.data);
    } catch (error) {
      toast.error('Failed to load trainers');
    } finally {
      setLoading(false);
    }
  };

  const loadAllReports = async () => {
    setLoading(true);
    try {
      const res = await ReportService.getAllReports();
      if (res.success) setReports(res.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete ${userName}?`)) return;
    
    try {
      const res = await AdminService.deleteUser(userId);
      if (res.success) {
        toast.success('User deleted successfully');
        activeTab === 'customers' ? loadCustomers() : loadTrainers();
        loadDashboardData(); // Refresh stats
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleUpdateReportStatus = async (reportId, status) => {
    try {
      const res = await ReportService.updateReportStatus(reportId, status);
      if (res.success) {
        toast.success('Report status updated');
        loadAllReports();
        loadDashboardData(); // Refresh stats
        setSelectedReport(null);
      }
    } catch (error) {
      toast.error('Failed to update report status');
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      const res = await ReportService.deleteReport(reportId);
      if (res.success) {
        toast.success('Report deleted successfully');
        loadAllReports();
        loadDashboardData(); // Refresh stats
        setSelectedReport(null);
      }
    } catch (error) {
      toast.error('Failed to delete report');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'customers') loadCustomers();
    if (tab === 'trainers') loadTrainers();
    if (tab === 'reports') loadAllReports();
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      PENDING: 'status-pending',
      REVIEWED: 'status-reviewed',
      RESOLVED: 'status-resolved',
      DISMISSED: 'status-dismissed'
    };
    return statusColors[status] || '';
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>
          <FiBarChart2 /> Admin Dashboard
        </h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            className="btn-refresh" 
            onClick={loadDashboardData}
            disabled={loading}
          >
            <FiRefreshCw className={loading ? 'spinning' : ''} /> Refresh
          </button>
          <button 
            className="btn-refresh" 
            onClick={() => {
              logout();
              navigate('/admin/login');
              toast.info('Logged out successfully');
            }}
            style={{ background: '#dc3545' }}
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <FiUsers className="stat-icon" />
            <div className="stat-info">
              <h3>{stats.totalUsers}</h3>
              <p>Total Customers</p>
            </div>
          </div>
          <div className="stat-card">
            <FiUserCheck className="stat-icon" />
            <div className="stat-info">
              <h3>{stats.totalTrainers}</h3>
              <p>Total Trainers</p>
            </div>
          </div>
          <div className="stat-card">
            <FiAlertCircle className="stat-icon alert" />
            <div className="stat-info">
              <h3>{stats.pendingReports}</h3>
              <p>Pending Reports</p>
            </div>
          </div>
          <div className="stat-card">
            <FiBarChart2 className="stat-icon" />
            <div className="stat-info">
              <h3>{stats.activeAssignments}</h3>
              <p>Active Assignments</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="admin-tabs">
        <button 
          className={activeTab === 'stats' ? 'active' : ''}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button 
          className={activeTab === 'customers' ? 'active' : ''}
          onClick={() => handleTabChange('customers')}
        >
          Customers
        </button>
        <button 
          className={activeTab === 'trainers' ? 'active' : ''}
          onClick={() => handleTabChange('trainers')}
        >
          Trainers
        </button>
        <button 
          className={`${activeTab === 'reports' ? 'active' : ''} ${stats?.pendingReports > 0 ? 'has-notification' : ''}`}
          onClick={() => handleTabChange('reports')}
          data-count={stats?.pendingReports || 0}
        >
          Reports
        </button>
      </div>

      {/* Tab Content */}
      <div className="admin-content">
        {activeTab === 'stats' && (
          <div className="stats-view">
            <h2>Dashboard Overview</h2>
            <p>Select a tab above to manage customers, trainers, or view reports.</p>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="users-list">
            <h2>Customers Management</h2>
            {loading ? (
              <div className="loading">Loading customers...</div>
            ) : customers.length === 0 ? (
              <p>No customers found.</p>
            ) : (
              <div className="table-responsive">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map(customer => (
                      <tr key={customer.id}>
                        <td>{customer.fullName}</td>
                        <td>{customer.username}</td>
                        <td>{customer.email}</td>
                        <td>
                          <span className={`badge ${customer.emailVerified ? 'badge-success' : 'badge-warning'}`}>
                            {customer.emailVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td>{new Date(customer.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteUser(customer.id, customer.fullName)}
                            title="Delete customer"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'trainers' && (
          <div className="users-list">
            <h2>Trainers Management</h2>
            {loading ? (
              <div className="loading">Loading trainers...</div>
            ) : trainers.length === 0 ? (
              <p>No trainers found.</p>
            ) : (
              <div className="table-responsive">
                <table className="users-table">
                  <thead>
                    <tr>
                      <th>Full Name</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Active Clients</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainers.map(trainer => (
                      <tr key={trainer.id}>
                        <td>{trainer.fullName}</td>
                        <td>{trainer.username}</td>
                        <td>{trainer.email}</td>
                        <td>
                          <span className="badge badge-info">
                            {trainer.assignedClients || 0} clients
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${trainer.emailVerified ? 'badge-success' : 'badge-warning'}`}>
                            {trainer.emailVerified ? 'Verified' : 'Unverified'}
                          </span>
                        </td>
                        <td>{new Date(trainer.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            className="btn-delete"
                            onClick={() => handleDeleteUser(trainer.id, trainer.fullName)}
                            title="Delete trainer"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="reports-list">
            <h2>
              Reports Management 
              {stats?.pendingReports > 0 && (
                <span className="notification-badge">{stats.pendingReports} pending</span>
              )}
            </h2>
            {loading ? (
              <div className="loading">Loading reports...</div>
            ) : reports.length === 0 ? (
              <p>No reports found.</p>
            ) : (
              <div className="reports-grid">
                {reports.map(report => (
                  <div key={report.id} className={`report-card ${getStatusBadge(report.status)}`}>
                    <div className="report-header">
                      <span className={`status-badge ${getStatusBadge(report.status)}`}>
                        {report.status}
                      </span>
                      <span className="report-date">
                        {new Date(report.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="report-body">
                      <div className="report-section">
                        <strong>Customer:</strong>
                        <p>{report.customerName}</p>
                        <p className="text-small">{report.customerEmail}</p>
                      </div>
                      <div className="report-section">
                        <strong>Reported Trainer:</strong>
                        <p>{report.trainerName}</p>
                        <p className="text-small">{report.trainerEmail}</p>
                      </div>
                      <div className="report-section">
                        <strong>Message:</strong>
                        <p className="report-message">{report.message}</p>
                      </div>
                    </div>
                    <div className="report-actions">
                      {report.status === 'PENDING' && (
                        <>
                          <button 
                            className="btn-action btn-reviewed"
                            onClick={() => handleUpdateReportStatus(report.id, 'REVIEWED')}
                          >
                            Mark Reviewed
                          </button>
                          <button 
                            className="btn-action btn-resolved"
                            onClick={() => handleUpdateReportStatus(report.id, 'RESOLVED')}
                          >
                            Resolve
                          </button>
                          <button 
                            className="btn-action btn-dismissed"
                            onClick={() => handleUpdateReportStatus(report.id, 'DISMISSED')}
                          >
                            Dismiss
                          </button>
                        </>
                      )}
                      <button 
                        className="btn-action btn-delete-report"
                        onClick={() => handleDeleteReport(report.id)}
                      >
                        <FiTrash2 /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
