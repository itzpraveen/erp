/**
 * WebSocket client for real-time communication
 */

// Determine WebSocket URL based on environment
const getWebSocketUrl = () => {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = process.env.NODE_ENV === 'production' 
    ? window.location.host 
    : 'localhost:3001';
  
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
  if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
    console.log('WebSocket already connected or connecting');
    return socket;
  }

  try {
    const socketUrl = getWebSocketUrl();
    console.log(`Connecting to WebSocket at ${socketUrl}`);
    
    socket = new WebSocket(socketUrl);
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      
      // Send a ping to the server
      sendMessage({ type: 'ping' });
    };
    
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message received:', data);
        
        // Notify all handlers
        messageHandlers.forEach(handler => handler(data));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    socket.onclose = (event) => {
      console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
      
      // Try to reconnect if not a deliberate closure
      if (event.code !== 1000) {
        scheduleReconnect();
      }
    };
    
    return socket;
  } catch (error) {
    console.error('Error creating WebSocket connection:', error);
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
    console.log(`Scheduling WebSocket reconnection (attempt ${reconnectAttempts}/${MAX_RECONNECT_ATTEMPTS})...`);
    
    reconnectTimer = setTimeout(() => {
      console.log('Attempting to reconnect WebSocket...');
      initSocket();
    }, RECONNECT_DELAY);
  } else {
    console.error(`Maximum reconnection attempts (${MAX_RECONNECT_ATTEMPTS}) reached, giving up`);
  }
};

// Send a message through the WebSocket
const sendMessage = (message) => {
  if (!socket || socket.readyState !== WebSocket.OPEN) {
    console.error('WebSocket is not connected, cannot send message');
    return false;
  }
  
  try {
    const messageString = typeof message === 'string' ? message : JSON.stringify(message);
    socket.send(messageString);
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
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
