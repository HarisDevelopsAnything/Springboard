import api from './api';

const tracker = {
  // Workouts
  createWorkout: (payload) => api.post('/tracker/workouts', payload),
  listWorkouts: (params) => api.get('/tracker/workouts', { params }),
  deleteWorkout: (id) => api.delete(`/tracker/workouts/${id}`),

  // Meals
  createMeal: (payload) => api.post('/tracker/meals', payload),
  listMeals: (params) => api.get('/tracker/meals', { params }),
  deleteMeal: (id) => api.delete(`/tracker/meals/${id}`),

  // Daily stats
  upsertDailyStat: (payload) => api.post('/tracker/daily-stats', payload),
  listDailyStats: () => api.get('/tracker/daily-stats'),
};

export default tracker;
