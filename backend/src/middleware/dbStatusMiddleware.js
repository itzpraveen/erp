/**
 * Middleware to check database connection status
 * Helps prevent operations when the database is disconnected
 */
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const dbStatusMiddleware = (req, res, next) => {
  // Skip health check endpoints to prevent circular issues
  if (req.originalUrl.includes('/health') || req.originalUrl === '/status') {
    return next();
  }
  
  // Get current connection state
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbState = mongoose.connection.readyState;
  
  if (dbState !== 1) {
    logger.error('Database connection is not ready', { 
      path: req.originalUrl, 
      method: req.method,
      dbState: dbState 
    });
    
    // Return a 503 Service Unavailable when database is not connected
    if (dbState === 0) {
      return res.status(503).json({
        status: 'error',
        message: 'Database is currently disconnected. Please try again later.'
      });
    }

    // Return a different message when database is connecting
    if (dbState === 2) {
      return res.status(503).json({
        status: 'error',
        message: 'Database connection is being established. Please try again in a moment.'
      });
    }
    
    // For other states (like disconnecting)
    return res.status(503).json({
      status: 'error',
      message: 'Database is currently unavailable. Please try again later.'
    });
  }
  
  // If database is connected, proceed to the next middleware
  next();
};

module.exports = dbStatusMiddleware;
