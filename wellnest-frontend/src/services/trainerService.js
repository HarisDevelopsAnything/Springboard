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
};

export default TrainerService;
