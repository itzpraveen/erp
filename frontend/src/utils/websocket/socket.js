/**
 * WebSocket client for real-time communication
 */

const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host; // Use the same host as the page
  
  // Production and Railway deployment: use same host
  return `${protocol}//${host}/ws`;
};

let socket = null;
let reconnectTimer = null;
const RECONNECT_DELAY = 3000; // 3 seconds
const MAX_RECONNECT_ATTEMPTS = 5;
let reconnectAttempts = 0;
let messageHandlers = [];

// Initialize WebSocket connection
const initSocket = () => {
  // For development debugging, we can disable WebSocket completely if needed
  if (sessionStorage.getItem('disableWebsocket') === 'true') {
    return null;
  }

  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    return socket;
  }

  try {
    const socketUrl = getWebSocketUrl();
    
    socket = new WebSocket(socketUrl);
    
    socket.onopen = () => {
      reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      
      // Send a ping to the server
      sendMessage({ type: 'ping' });
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Notify all handlers
        messageHandlers.forEach(handler => handler(data));
      } catch (error) {
        // Silent error in production
      }
    };
    
    socket.onerror = (error) => {
      // After reaching max attempts, disable WebSocket for this session
      if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS - 1) {
        sessionStorage.setItem('disableWebsocket', 'true');
      }
    };
    
    socket.onclose = (event) => {
      // Try to reconnect if not a deliberate closure
      if (event.code !== 1000) {
        scheduleReconnect();
      }
    };
    
    return socket;
  } catch (error) {
    scheduleReconnect();
    return null;
  }
};

// Schedule reconnection
const scheduleReconnect = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
  }
  
  if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
    reconnectAttempts++;
    
    reconnectTimer = setTimeout(() => {
      initSocket();
    }, RECONNECT_DELAY);
  }
};

// Send a message through the WebSocket
const sendMessage = (message) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    return false;
  }
  
  try {
    const messageString = typeof message === 'string' ? message : JSON.stringify(message);
    socket.send(messageString);
    return true;
  } catch (error) {
    return false;
  }
};

// Add a message handler
const addMessageHandler = (handler) => {
  if (typeof handler === 'function') {
    messageHandlers.push(handler);
    return true;
  }
  return false;
};

// Remove a message handler
const removeMessageHandler = (handler) => {
  const index = messageHandlers.indexOf(handler);
  if (index !== -1) {
    messageHandlers.splice(index, 1);
    return true;
  }
  return false;
};

// Close the WebSocket connection
const closeSocket = () => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.close(1000, 'Deliberate disconnection');
    return true;
  }
  return false;
};

// Auto-initialize when imported
if (typeof window !== 'undefined') {
  // Only initialize in browser environment
  window.addEventListener('load', () => {
    initSocket();
  });
}

export {
  initSocket,
  sendMessage,
  addMessageHandler,
  removeMessageHandler,
  closeSocket
};