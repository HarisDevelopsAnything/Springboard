import api from './api';

const aiChatService = {
  sendMessage: async (message, history = []) => {
    try {
      const response = await api.post('/ai-chat/message', {
        message,
        history,
      });
      return response.data;
    } catch (error) {
      console.error('AI chat send error:', error);
      const backendMessage = error?.response?.data?.message;
      if (backendMessage) {
        console.error('AI chat backend message:', backendMessage);
      }
      throw new Error(backendMessage || 'AI coach is unavailable right now. Please try again.');
    }
  },
};

export default aiChatService;
