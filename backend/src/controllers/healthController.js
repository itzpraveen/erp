/**
 * Health controller for monitoring the health of the application
 */
const mongoose = require('mongoose');
const logger = require('../utils/logger');

/**
 * @desc    Get application health status
 * @route   GET /api/health
 * @access  Public
 */
const getHealth = async (req, res) => {
  try {
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      env: process.env.NODE_ENV,
      memory: process.memoryUsage(),
      database: {
        connected: mongoose.connection.readyState === 1
      }
    };
    
    // Check database connection
    if (mongoose.connection.readyState === 1) {
      try {
        // Run simple ping command to verify database connection
        await mongoose.connection.db.admin().ping();
        healthData.database.ping = 'ok';
      } catch (err) {
        healthData.database.ping = 'error';
        healthData.database.error = err.message;
      }
    } else {
      healthData.database.state = mongoose.connection.readyState;
    }
    
    logger.info('Health check passed');
    return res.status(200).json(healthData);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    return res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

/**
 * @desc    Get auth test - requires authentication
 * @route   GET /api/health/auth
 * @access  Private
 */
const getAuthTest = async (req, res) => {
  try {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Authentication successful',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    logger.error('Auth test failed', { error: error.message });
    return res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
};

module.exports = {
  getHealth,
  getAuthTest
};