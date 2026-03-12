import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import TrainerService from '../../services/trainerService';
import { FiSend, FiUser, FiMessageCircle } from 'react-icons/fi';
import './ChatPage.css';

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatData();
    // Refresh messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
    setLoading(true);
    try {
      // Get trainer assignment to find who to chat with
      const assignmentResult = await TrainerService.getMyTrainerToday();
      if (assignmentResult.success && assignmentResult.data) {
        const trainer = assignmentResult.data;
        setOtherUser({
          id: trainer.id,
          name: trainer.fullName || trainer.username,
          email: trainer.email
        });
        loadMessages(trainer.id);
      } else {
        toast.info('Please select a trainer to start chatting');
      }
    } catch (error) {
      console.error('Failed to load chat data:', error);
      toast.error('Failed to load chat. Please select a trainer first.');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherId = otherUser?.id) => {
    if (!otherId) return;
    
    try {
      const result = await chatService.getConversation(otherId);
      if (result.success) {
        setMessages(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !otherUser) {
      return;
    }

    try {
      const result = await chatService.sendMessage({
        receiverId: otherUser.id,
        message: newMessage.trim()
      });

      if (result.success) {
        setNewMessage('');
        loadMessages();
      } else {
        toast.error('Failed to send message');
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="chat-page">
        <div className="loading-state">Loading chat...</div>
      </div>
    );
  }

  if (!otherUser) {
    return (
      <div className="chat-page">
        <div className="empty-state">
          <FiMessageCircle className="empty-icon" />
          <h2>No Active Trainer</h2>
          <p>Please select a trainer to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-header">
          <div className="chat-user-info">
            <div className="user-avatar">
              <FiUser />
            </div>
            <div>
              <h2>{otherUser.name}</h2>
              <p className="user-role">Your Trainer</p>
            </div>
          </div>
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="no-messages">
              <FiMessageCircle />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.senderId === user.id ? 'message-sent' : 'message-received'}`}
              >
                <div className="message-content">
                  <div className="message-text">{msg.message}</div>
                  <div className="message-time">
                    {new Date(msg.createdAt).toLocaleString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <form className="chat-input-form" onSubmit={handleSendMessage}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="chat-input"
          />
          <button type="submit" className="btn-send" disabled={!newMessage.trim()}>
            <FiSend />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
