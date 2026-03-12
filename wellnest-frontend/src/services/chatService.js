import api from './api';

const chatService = {
  sendMessage: async (messageData) => {
    try {
      const response = await api.post('/chat/send', messageData);
      return response.data;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  getConversation: async (otherUserId) => {
    try {
      const response = await api.get(`/chat/conversation/${otherUserId}`);
      return response.data;
    } catch (error) {
      console.error('Get conversation error:', error);
      throw error;
    }
  },

  getUnreadMessages: async () => {
    try {
      const response = await api.get('/chat/unread');
      return response.data;
    } catch (error) {
      console.error('Get unread messages error:', error);
      throw error;
    }
  },

  getUnreadCount: async () => {
    try {
      const response = await api.get('/chat/unread/count');
      return response.data;
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  },

  markAsRead: async (messageId) => {
    try {
      const response = await api.put(`/chat/${messageId}/read`);
      return response.data;
    } catch (error) {
      console.error('Mark as read error:', error);
      throw error;
    }
  }
};

export default chatService;
