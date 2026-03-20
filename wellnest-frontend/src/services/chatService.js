import api from './api';
import { Client } from '@stomp/stompjs';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
const WS_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '').replace(/^http/, 'ws');

let stompClient = null;

const getConversationId = (userA, userB) =>
  userA < userB ? `${userA}_${userB}` : `${userB}_${userA}`;

const chatService = {
  getConversation: async (otherUserId) => {
    try {
      const response = await api.get(`/chat/conversation/${otherUserId}`);
      return response.data;
    } catch (error) {
      console.error('Get conversation error:', error);
      throw error;
    }
  },

  getContacts: async () => {
    try {
      const response = await api.get('/chat/contacts');
      return response.data;
    } catch (error) {
      console.error('Get chat contacts error:', error);
      throw error;
    }
  },

  deleteForMe: async (messageId) => {
    const response = await api.delete(`/chat/${messageId}/for-me`);
    return response.data;
  },

  deleteForEveryone: async (messageId) => {
    const response = await api.delete('/chat/for-everyone', {
      data: { messageId },
    });
    return response.data;
  },

  connectSocket: (token, onConnected, onError) => {
    if (stompClient && stompClient.active) {
      onConnected?.();
      return stompClient;
    }

    stompClient = new Client({
      brokerURL: `${WS_BASE_URL}/ws-chat`,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 3000,
      debug: () => {},
      onConnect: () => onConnected?.(),
      onStompError: (frame) => onError?.(frame.headers?.message || 'STOMP error'),
      onWebSocketError: () => onError?.('WebSocket connection error'),
    });

    stompClient.activate();
    return stompClient;
  },

  disconnectSocket: () => {
    if (stompClient) {
      stompClient.deactivate();
      stompClient = null;
    }
  },

  subscribeConversation: (myUserId, otherUserId, onMessage) => {
    if (!stompClient || !stompClient.connected) {
      throw new Error('Socket not connected');
    }

    const conversationId = getConversationId(myUserId, otherUserId);
    return stompClient.subscribe(`/topic/chat.${conversationId}`, (frame) => {
      const payload = JSON.parse(frame.body);
      onMessage?.(payload);
    });
  },

  sendSocketMessage: (receiverId, message) => {
    if (!stompClient || !stompClient.connected) {
      throw new Error('Socket not connected');
    }

    stompClient.publish({
      destination: '/app/chat.send',
      body: JSON.stringify({ receiverId, message }),
    });
  },

  sendDeleteForEveryone: (messageId) => {
    if (!stompClient || !stompClient.connected) {
      throw new Error('Socket not connected');
    }

    stompClient.publish({
      destination: '/app/chat.deleteForEveryone',
      body: JSON.stringify({ messageId }),
    });
  }
};

export default chatService;
