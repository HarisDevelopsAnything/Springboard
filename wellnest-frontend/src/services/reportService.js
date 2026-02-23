import api from './api';

const ReportService = {
  // Create a report against a trainer
  createReport: async (data) => {
    const response = await api.post('/reports', data);
    return response.data;
  },

  // Get my reports (customer)
  getMyReports: async () => {
    const response = await api.get('/reports/my-reports');
    return response.data;
  },

  // Get all reports (admin)
  getAllReports: async () => {
    const response = await api.get('/reports');
    return response.data;
  },

  // Get pending reports (admin)
  getPendingReports: async () => {
    const response = await api.get('/reports/pending');
    return response.data;
  },

  // Update report status (admin)
  updateReportStatus: async (reportId, status) => {
    const response = await api.patch(`/reports/${reportId}/status?status=${status}`);
    return response.data;
  },

  // Delete report (admin)
  deleteReport: async (reportId) => {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
  },

  // Get reports by trainer (admin)
  getReportsByTrainer: async (trainerId) => {
    const response = await api.get(`/reports/trainer/${trainerId}`);
    return response.data;
  },
};

export default ReportService;
