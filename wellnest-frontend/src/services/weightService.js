import api from './api';

const weightService = {
  addWeight: async (weightData) => {
    try {
      const response = await api.post('/weight/add', weightData);
      return response.data;
    } catch (error) {
      console.error('Add weight error:', error);
      throw error;
    }
  },

  getHistory: async () => {
    try {
      const response = await api.get('/weight/history');
      return response.data;
    } catch (error) {
      console.error('Get weight history error:', error);
      throw error;
    }
  },

  getHistoryRange: async (startDate, endDate) => {
    try {
      const response = await api.get('/weight/history/range', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Get weight history range error:', error);
      throw error;
    }
  },

  deleteEntry: async (entryId) => {
    try {
      const response = await api.delete(`/weight/${entryId}`);
      return response.data;
    } catch (error) {
      console.error('Delete weight entry error:', error);
      throw error;
    }
  },

  calculateBmi: async (weight, height) => {
    try {
      const response = await api.post('/weight/calculate-bmi', null, {
        params: { weight, height }
      });
      return response.data;
    } catch (error) {
      console.error('Calculate BMI error:', error);
      throw error;
    }
  },

  getWeightHistory: async (userId) => {
    try {
      const response = await api.get(`/weight/history/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get weight history error:', error);
      throw error;
    }
  }
};

export default weightService;
