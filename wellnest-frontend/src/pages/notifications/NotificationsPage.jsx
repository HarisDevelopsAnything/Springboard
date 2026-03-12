import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import notificationService from '../../services/notificationService';
import { FiBell, FiCheck, FiTrash2, FiCheckCircle, FiX } from 'react-icons/fi';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' or 'unread'

  useEffect(() => {
    loadNotifications();
  }, [filter]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const result = filter === 'unread' 
        ? await notificationService.getUnreadNotifications()
        : await notificationService.getNotifications();
      
      if (result.success) {
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        loadNotifications();
      }
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const result = await notificationService.markAllAsRead();
      if (result.success) {
        toast.success('All notifications marked as read');
        loadNotifications();
      }
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const result = await notificationService.deleteNotification(notificationId);
      if (result.success) {
        toast.success('Notification deleted');
        loadNotifications();
      }
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'WORKOUT_ASSIGNED':
      case 'WORKOUT_UPDATED':
        return '🏋️';
      case 'TRAINER_MESSAGE':
        return '💬';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'WORKOUT_ASSIGNED':
        return '#10b981';
      case 'WORKOUT_UPDATED':
        return '#f59e0b';
      case 'TRAINER_MESSAGE':
        return '#667eea';
      default:
        return '#64748b';
    }
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="loading-state">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <div>
          <h1>
            <FiBell /> Notifications
          </h1>
          <p>Stay updated with your fitness journey</p>
        </div>
        <div className="header-actions">
          <button
            className="btn-mark-all-read"
            onClick={handleMarkAllAsRead}
            disabled={notifications.filter(n => !n.isRead).length === 0}
          >
            <FiCheckCircle /> Mark All Read
          </button>
        </div>
      </div>

      <div className="notifications-filters">
        <button
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          All ({notifications.length})
        </button>
        <button
          className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
          onClick={() => setFilter('unread')}
        >
          Unread ({notifications.filter(n => !n.isRead).length})
        </button>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <FiBell className="empty-icon" />
          <h2>No {filter === 'unread' ? 'Unread ' : ''}Notifications</h2>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
            >
              <div className="notification-left">
                <div 
                  className="notification-icon"
                  style={{ borderColor: getNotificationColor(notification.type) }}
                >
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="notification-content">
                  <h3>{notification.title}</h3>
                  <p>{notification.message}</p>
                  <div className="notification-time">
                    {new Date(notification.createdAt).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    })}
                  </div>
                </div>
              </div>
              <div className="notification-actions">
                {!notification.isRead && (
                  <button
                    className="btn-action btn-mark-read"
                    onClick={() => handleMarkAsRead(notification.id)}
                    title="Mark as read"
                  >
                    <FiCheck />
                  </button>
                )}
                <button
                  className="btn-action btn-delete"
                  onClick={() => handleDeleteNotification(notification.id)}
                  title="Delete"
                >
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
