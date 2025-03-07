/**
 * Simple test controller for debugging
 */
const User = require('../models/User');
const logger = require('../utils/logger');

/**
 * @desc    Get test endpoint
 * @route   GET /api/test
 * @access  Public
 */
const testEndpoint = async (req, res) => {
  try {
    // Count users in the database for simple verification
    const userCount = await User.countDocuments();
    
    res.json({
      success: true,
      message: 'Test endpoint is working',
      timestamp: new Date().toISOString(),
      userCount
    });
  } catch (error) {
    logger.error('Test endpoint error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Test endpoint error',
      error: error.message
    });
  }
};

/**
 * @desc    Get test users list without authentication
 * @route   GET /api/test/users
 * @access  Public
 */
const testUsers = async (req, res) => {
  try {
    // Get all users (just for debugging - in production should be protected)
    const users = await User.find({}).select('name email role department active');
    
    res.json({
      success: true,
      count: users.length,
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        active: user.active
      }))
    });
  } catch (error) {
    logger.error('Test users endpoint error', { error: error.message });
    res.status(500).json({
      success: false,
      message: 'Test users endpoint error',
      error: error.message
    });
  }
};

module.exports = {
  testEndpoint,
  testUsers
};