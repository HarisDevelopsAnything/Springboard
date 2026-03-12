import api from './api';

const workoutAssignmentService = {
  assignWorkout: async (assignmentData) => {
    try {
      const response = await api.post('/workout-assignments/assign', assignmentData);
      return response.data;
    } catch (error) {
      console.error('Assign workout error:', error);
      throw error;
    }
  },

  updateWorkout: async (assignmentId, assignmentData) => {
    try {
      const response = await api.put(`/workout-assignments/${assignmentId}`, assignmentData);
      return response.data;
    } catch (error) {
      console.error('Update workout error:', error);
      throw error;
    }
  },

  getMyActiveAssignment: async () => {
    try {
      const response = await api.get('/workout-assignments/my-assignment');
      return response.data;
    } catch (error) {
      console.error('Get my active assignment error:', error);
      throw error;
    }
  },

  getMyAssignmentHistory: async () => {
    try {
      const response = await api.get('/workout-assignments/my-history');
      return response.data;
    } catch (error) {
      console.error('Get my assignment history error:', error);
      throw error;
    }
  },

  getTrainerAssignments: async () => {
    try {
      const response = await api.get('/workout-assignments/trainer/all');
      return response.data;
    } catch (error) {
      console.error('Get trainer assignments error:', error);
      throw error;
    }
  }
};

export default workoutAssignmentService;
