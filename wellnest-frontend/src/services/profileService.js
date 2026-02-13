import api from './api';

const ProfileService = {
  getProfile: async () => {
    const response = await api.get('/profile');
    return response.data;
  },

  saveFitnessProfile: async (data) => {
    const response = await api.post('/profile/fitness', data);
    return response.data;
  },
};

export default ProfileService;
