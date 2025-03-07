import React, { useEffect, useState, useCallback } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { initSocket, addMessageHandler, removeMessageHandler } from '../utils/websocket/socket';

const WebSocketNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  // Removed unused state variables for showConnectionErrors
  const [isConnected, setIsConnected] = useState(false);
  
  // Dismiss a notification
  const dismissNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);
  
  // Create the addNotification function with useCallback to prevent dependency issues
  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now(),
      title: notification.title,
      message: notification.message,
      timestamp: new Date().toISOString(),
      type: notification.type
    };
    
    // Add the notification to state
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      dismissNotification(newNotification.id);
    }, 5000);
  }, [dismissNotification]);
  
  useEffect(() => {
    // Don't try to initialize websocket if disabled
    if (sessionStorage.getItem('disableWebsocket') === 'true') {
      return;
    }

    // Initialize WebSocket
    const socket = initSocket();
    if (socket) {
      socket.addEventListener('open', () => {
        setIsConnected(true);
        // Add a success notification only if connection was previously lost
        if (!isConnected) {
          addNotification({
            title: 'WebSocket Connected',
            message: 'Real-time notifications are now enabled',
            type: 'success'
          });
        }
      });

      socket.addEventListener('close', () => {
        // Only show notification if we were previously connected
        if (isConnected) {
          setIsConnected(false);
          addNotification({
            title: 'WebSocket Disconnected',
            message: 'Real-time updates are temporarily disabled',
            type: 'warning'
          });
        }
      });
    }
    
    // Create handler for incoming messages
    const handleWebSocketMessage = (data) => {
      if (data.type === 'notification' || data.type === 'connection') {
        // Create a notification object
        addNotification({
          title: data.title || 'Notification',
          message: data.message || 'You have a new notification',
          type: data.notificationType || 'info'
        });
      }
    };
    
    // Register the handler
    addMessageHandler(handleWebSocketMessage);
    
    // Cleanup
    return () => {
      removeMessageHandler(handleWebSocketMessage);
    };
  }, [isConnected, addNotification]);
  
  // Get Bootstrap variant based on notification type
  const getVariant = (type) => {
    switch (type) {
      case 'error':
        return 'danger';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      default:
        return 'info';
    }
  };
  
  return (
    <ToastContainer position="top-end" className="p-3 position-fixed" style={{ zIndex: 1056 }}>
      {notifications.map(notification => (
        <Toast 
          key={notification.id} 
          onClose={() => dismissNotification(notification.id)}
          bg={getVariant(notification.type)}
          className="mb-2"
        >
          <Toast.Header>
            <strong className="me-auto">{notification.title}</strong>
            <small>{new Date(notification.timestamp).toLocaleTimeString()}</small>
          </Toast.Header>
          <Toast.Body className={notification.type === 'error' ? 'text-white' : ''}>
            {notification.message}
          </Toast.Body>
        </Toast>
      ))}
    </ToastContainer>
  );
};

export default WebSocketNotifications;