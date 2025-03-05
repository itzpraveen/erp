import React, { useEffect, useState } from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';
import { initSocket, addMessageHandler, removeMessageHandler } from '../utils/websocket/socket';

const WebSocketNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showConnectionErrors, setShowConnectionErrors] = useState(false); // Default to not showing connection errors
  
  useEffect(() => {
    // Check if we should try to connect to WebSocket
    // In development, we might not have the backend running
    // This is a simple way to prevent connection errors from being shown
    if (!showConnectionErrors) {
      return;
    }

    // Initialize WebSocket
    initSocket();
    
    // Create handler for incoming messages
    const handleWebSocketMessage = (data) => {
      if (data.type === 'notification' || data.type === 'connection') {
        // Create a notification object
        const newNotification = {
          id: Date.now(),
          title: data.type === 'connection' ? 'WebSocket Connected' : data.title || 'Notification',
          message: data.message || 'You have a new notification',
          timestamp: new Date().toISOString(),
          type: data.notificationType || 'info'
        };
        
        // Add the notification to state
        setNotifications(prev => [...prev, newNotification]);
        
        // Auto-dismiss after 5 seconds
        setTimeout(() => {
          dismissNotification(newNotification.id);
        }, 5000);
      }
    };
    
    // Register the handler
    addMessageHandler(handleWebSocketMessage);
    
    // Cleanup
    return () => {
      removeMessageHandler(handleWebSocketMessage);
    };
  }, [showConnectionErrors]);
  
  // Dismiss a notification
  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };
  
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
