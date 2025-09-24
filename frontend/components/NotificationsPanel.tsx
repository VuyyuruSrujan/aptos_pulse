import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Notification } from '../types';
import '../styles/notifications.css';

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
}

const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  onMarkAsRead,
  onClearAll
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return 'ℹ️';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="notifications-panel">
      <motion.button
        className="notifications-trigger glass"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="notification-icon">🔔</span>
        {unreadCount > 0 && (
          <motion.span
            className="notification-badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={unreadCount}
          >
            {unreadCount}
          </motion.span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="notifications-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              className="notifications-dropdown glass"
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <div className="notifications-header">
                <h3>Notifications</h3>
                {notifications.length > 0 && (
                  <motion.button
                    className="clear-all-btn"
                    onClick={onClearAll}
                    whileHover={{ scale: 1.05 }}
                  >
                    Clear All
                  </motion.button>
                )}
              </div>

              <div className="notifications-list">
                {notifications.length === 0 ? (
                  <div className="no-notifications">
                    <span>🌟</span>
                    <p>All caught up!</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      whileHover={{ x: 5 }}
                      onClick={() => onMarkAsRead(notification.id)}
                    >
                      <div className="notification-icon-wrapper">
                        <span className="notification-type-icon">
                          {getNotificationIcon(notification.type)}
                        </span>
                      </div>
                      
                      <div className="notification-content">
                        <h4 className="notification-title">{notification.title}</h4>
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-timestamp">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                      </div>

                      {!notification.read && (
                        <motion.div
                          className="unread-indicator"
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                        />
                      )}
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationsPanel;