import { useState, useEffect } from 'react';
import { Bell, X, MessageCircle } from 'lucide-react';
import TrainerService from '../services/trainerService';
import './TrainerNotifications.css';

const TrainerNotifications = () => {
  const [messages, setMessages] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUnreadMessages();
    // Poll for new messages every 60 seconds
    const interval = setInterval(loadUnreadMessages, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadMessages = async () => {
    try {
      setLoading(true);
      const result = await TrainerService.getUnreadMessages();
      if (result.success && result.data) {
        setMessages(result.data);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await TrainerService.markMessageAsRead(messageId);
      // Remove from list
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    
    // Less than 1 hour
    if (diff < 3600000) {
      const minutes = Math.floor(diff / 60000);
      return minutes === 0 ? 'Just now' : `${minutes}m ago`;
    }
    
    // Less than 24 hours
    if (diff < 86400000) {
      const hours = Math.floor(diff / 3600000);
      return `${hours}h ago`;
    }
    
    // Less than 7 days
    if (diff < 604800000) {
      const days = Math.floor(diff / 86400000);
      return `${days}d ago`;
    }
    
    // Otherwise show date
    return date.toLocaleDateString();
  };

  const unreadCount = messages.length;

  return (
    <div className="trainer-notifications">
      <button 
        className="notification-bell" 
        onClick={() => setIsOpen(!isOpen)}
        title="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {isOpen && (
        <div className="notifications-dropdown">
          <div className="notifications-header">
            <div className="notifications-title">
              <MessageCircle size={18} />
              <span>Trainer Messages</span>
            </div>
            <button className="close-notifications" onClick={() => setIsOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <div className="notifications-list">
            {loading && messages.length === 0 ? (
              <div className="notifications-empty">
                <p>Loading messages...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="notifications-empty">
                <MessageCircle size={48} />
                <p>No new messages</p>
                <span>Your trainer hasn't sent any messages yet</span>
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="notification-item">
                  <div className="notification-content">
                    <div className="notification-header">
                      <strong>Message from your Trainer</strong>
                      <span className="notification-time">{formatDate(msg.createdAt)}</span>
                    </div>
                    <p className="notification-message">{msg.message}</p>
                  </div>
                  <button 
                    className="mark-read-btn" 
                    onClick={() => handleMarkAsRead(msg.id)}
                    title="Mark as read"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerNotifications;
