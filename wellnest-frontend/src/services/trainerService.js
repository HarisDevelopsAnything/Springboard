import api from './api';

const TrainerService = {
  /** Get all available trainers */
  getAvailableTrainers: async () => {
    const response = await api.get('/trainers');
    return response.data;
  },

  /** Trainee selects a trainer for today */
  selectTrainer: async (trainerId) => {
    const response = await api.post('/trainers/select', { trainerId });
    return response.data;
  },

  /** Trainer gets their trainees */
  getMyTrainees: async () => {
    const response = await api.get('/trainers/my-trainees');
    return response.data;
  },

  /** Trainee checks their trainer for today */
  getMyTrainerToday: async () => {
    const response = await api.get('/trainers/my-trainer-today');
    return response.data;
  },

  /** Trainer gets trainee's daily stats */
  getTraineeStats: async (traineeId) => {
    const response = await api.get(`/trainers/trainee-stats/${traineeId}`);
    return response.data;
  },

  /** Trainer sends message to trainee */
  sendMessage: async (traineeId, message) => {
    const response = await api.post('/trainers/send-message', { traineeId, message });
    return response.data;
  },

  /** Trainee gets unread messages */
  getUnreadMessages: async () => {
    const response = await api.get('/trainers/messages/unread');
    return response.data;
  },

  /** Trainee marks message as read */
  markMessageAsRead: async (messageId) => {
    const response = await api.put(`/trainers/messages/${messageId}/read`);
    return response.data;
  },
};

export default TrainerService;
