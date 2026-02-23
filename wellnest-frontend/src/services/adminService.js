import api from './api';

const AdminService = {
  // Get dashboard statistics
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Get all customers
  getAllCustomers: async () => {
    const response = await api.get('/admin/customers');
    return response.data;
  },

  // Get all trainers
  getAllTrainers: async () => {
    const response = await api.get('/admin/trainers');
    return response.data;
  },

  // Delete user (customer or trainer)
  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },
};

export default AdminService;
