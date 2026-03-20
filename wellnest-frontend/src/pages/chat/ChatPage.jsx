import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../services/chatService';
import TrainerService from '../../services/trainerService';
import { FiSend, FiUser, FiMessageCircle, FiMoreVertical, FiTrash2 } from 'react-icons/fi';
import './ChatPage.css';

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [contacts, setContacts] = useState([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [activeMenuMessageId, setActiveMenuMessageId] = useState('');
  const [loading, setLoading] = useState(true);
  const socketSubscriptionRef = useRef(null);
  const messagesEndRef = useRef(null);
  const selectedContactKey = `chat_selected_contact_${user?.id || 'unknown'}`;

  const isTrainer = user?.role === 'ROLE_TRAINER';

  const otherUser = contacts.find((c) => c.id === selectedContactId) || null;

  useEffect(() => {
    loadChatData();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to use chat');
      return;
    }

    chatService.connectSocket(
      token,
      () => {
        // connected
      },
      (errorMessage) => {
        toast.error(errorMessage || 'Socket connection failed');
      }
    );

    return () => {
      if (socketSubscriptionRef.current) {
        socketSubscriptionRef.current.unsubscribe();
      }
      chatService.disconnectSocket();
    };
  }, []);

  useEffect(() => {
    if (!selectedContactId) return;

    loadMessages(selectedContactId);

    if (socketSubscriptionRef.current) {
      socketSubscriptionRef.current.unsubscribe();
    }

    try {
      socketSubscriptionRef.current = chatService.subscribeConversation(
        user.id,
        selectedContactId,
        (incomingMessage) => {
          setMessages((prev) => {
            const existingIndex = prev.findIndex((m) => m.id === incomingMessage.id);
            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = incomingMessage;
              return updated;
            }
            return [...prev, incomingMessage];
          });
        }
      );
    } catch {
      // If socket not ready yet, conversation still works via REST history.
    }

    return () => {
      if (socketSubscriptionRef.current) {
        socketSubscriptionRef.current.unsubscribe();
        socketSubscriptionRef.current = null;
      }
    };
  }, [selectedContactId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChatData = async () => {
    setLoading(true);
    try {
      if (isTrainer) {
        const contactsResult = await chatService.getContacts();
        if (contactsResult.success) {
          const list = contactsResult.data || [];
          const mappedContacts = list.map((c) => ({
            id: c.id,
            name: c.fullName || c.username,
            role: c.role,
            unreadCount: Number(c.unreadCount || 0)
          }));
          setContacts(mappedContacts);

          const savedContactId = localStorage.getItem(selectedContactKey);
          if (savedContactId && mappedContacts.some((c) => c.id === savedContactId)) {
            setSelectedContactId(savedContactId);
          }
        }
      } else {
        const assignmentResult = await TrainerService.getMyTrainerToday();
        if (assignmentResult.success && assignmentResult.data) {
          const trainer = assignmentResult.data;
          const traineeContact = {
            id: trainer.id,
            name: trainer.fullName || trainer.username,
            role: 'ROLE_TRAINER',
            unreadCount: 0
          };
          setContacts([traineeContact]);
          setSelectedContactId(trainer.id);
          localStorage.setItem(selectedContactKey, trainer.id);
        } else {
          toast.info('Please select a trainer to start chatting');
        }
      }
    } catch (error) {
      console.error('Failed to load chat data:', error);
      toast.error('Failed to load chat data.');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (otherId = selectedContactId) => {
    if (!otherId) return;
    
    try {
      const result = await chatService.getConversation(otherId);
      if (result.success) {
        setMessages(result.data || []);
        setContacts((prev) => prev.map((c) => (
          c.id === otherId ? { ...c, unreadCount: 0 } : c
        )));

        try {
          const markReadResult = await chatService.markChatAsRead(otherId);
          const unreadCount = markReadResult?.success
            ? Number(markReadResult.data || 0)
            : 0;

          window.dispatchEvent(new CustomEvent('chat:read-updated', {
            detail: { count: unreadCount }
          }));
        } catch {
          window.dispatchEvent(new Event('chat:read-updated'));
        }
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
      chatService.sendSocketMessage(otherUser.id, newMessage.trim());
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleSelectContact = (contactId) => {
    if (selectedContactId === contactId) {
      setActiveMenuMessageId('');
      return;
    }

    setSelectedContactId(contactId);
    setMessages([]);
    setActiveMenuMessageId('');
    setContacts((prev) => prev.map((c) => (
      c.id === contactId ? { ...c, unreadCount: 0 } : c
    )));
    localStorage.setItem(selectedContactKey, contactId);
  };

  const handleDeleteForMe = async (messageId) => {
    try {
      const result = await chatService.deleteForMe(messageId);
      if (result.success) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    } catch {
      toast.error('Failed to delete for me');
    } finally {
      setActiveMenuMessageId('');
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    try {
      chatService.sendDeleteForEveryone(messageId);
    } catch {
      // fallback when socket briefly disconnects
      await chatService.deleteForEveryone(messageId);
      await loadMessages();
    } finally {
      setActiveMenuMessageId('');
    }
  };

  if (loading) {
    return (
      <div className="chat-page">
        <div className="loading-state">Loading chat...</div>
      </div>
    );
  }

  if (!isTrainer && !otherUser) {
    return (
      <div className="chat-page">
        <div className="empty-state">
          <FiMessageCircle className="empty-icon" />
          <h2>{isTrainer ? 'No Assigned Trainees' : 'No Active Trainer'}</h2>
          <p>
            {isTrainer
              ? 'No trainees are currently assigned to you for chat.'
              : 'Please select a trainer to start chatting'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-container">
        <div className="chat-layout">
          <div className="chat-members-pane">
            <div className="chat-members-header">
              <h3>{isTrainer ? 'Select Trainee Chat' : 'Trainer Chat'}</h3>
              <p>{isTrainer ? 'Choose a trainee to open chat' : 'Your assigned trainer'}</p>
            </div>

            {contacts.length === 0 ? (
              <div className="chat-members-empty">
                <FiMessageCircle />
                <span>{isTrainer ? 'No assigned trainees' : 'No trainer selected yet'}</span>
              </div>
            ) : (
              <div className="chat-members-list">
                {contacts.map((contact) => (
                  <button
                    key={contact.id}
                    type="button"
                    className={`chat-member-item ${selectedContactId === contact.id ? 'active' : ''}`}
                    onClick={() => handleSelectContact(contact.id)}
                  >
                    <div className="member-avatar">
                      <FiUser />
                    </div>
                    <div className="member-meta">
                      <strong>
                        {contact.name}
                        {Number(contact.unreadCount) > 0 && (
                          <span className="member-unread-badge">
                            {contact.unreadCount > 99 ? '99+' : contact.unreadCount}
                          </span>
                        )}
                      </strong>
                      <span>{contact.role === 'ROLE_TRAINER' ? 'Trainer' : 'Trainee'}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="chat-panel">
            {!otherUser ? (
              <div className="chat-select-placeholder">
                <FiMessageCircle className="empty-icon" />
                <h2>Select a trainee to start chatting</h2>
                <p>Pick a contact from the left panel.</p>
              </div>
            ) : (
              <>
                <div className="chat-header">
                  <div className="chat-user-info">
                    <div className="user-avatar">
                      <FiUser />
                    </div>
                    <div>
                      <h2>{otherUser.name}</h2>
                      <p className="user-role">{isTrainer ? 'Your Trainee' : 'Your Trainer'}</p>
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
                          <div className={`message-text ${msg.deletedForEveryone ? 'message-deleted' : ''}`}>
                            {msg.message}
                          </div>
                          <div className="message-time">
                            {new Date(msg.createdAt).toLocaleString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>

                          {!msg.deletedForEveryone && (
                            <div className="message-actions-wrap">
                              <button
                                type="button"
                                className="message-menu-btn"
                                onClick={() => setActiveMenuMessageId((prev) => prev === msg.id ? '' : msg.id)}
                              >
                                <FiMoreVertical />
                              </button>

                              {activeMenuMessageId === msg.id && (
                                <div className={`message-actions-menu ${msg.senderId === user.id ? 'menu-sender' : 'menu-receiver'}`}>
                                  <button type="button" onClick={() => handleDeleteForMe(msg.id)}>
                                    <FiTrash2 /> Delete for me
                                  </button>
                                  {msg.senderId === user.id && (
                                    <button type="button" onClick={() => handleDeleteForEveryone(msg.id)}>
                                      <FiTrash2 /> Delete for everyone
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
