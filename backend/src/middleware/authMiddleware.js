const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware
 * Checks for JWT token in various possible locations
 */
const protect = async (req, res, next) => {
  let token;

  // Check authorization header first (most common)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // Check for token in cookies
  else if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // Also check query parameter for token (for some clients)
  else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (token) {
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      const user = await User.findById(decoded.id).select('-password');
      
      // Check if user exists and is active
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      if (!user.active) {
        return res.status(401).json({ message: 'User account is inactive' });
      }

      // Set user in request object
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      
      // Provide specific error message based on error type
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired, please log in again' });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token, please log in again' });
      } else {
        return res.status(401).json({ message: 'Not authorized, authentication failed' });
      }
    }
  } else {
    // For routes checking authentication status, just return 401 without crashing
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    if (roles.includes(req.user.role)) {
      next();
    } else {
      res.status(401);
      throw new Error(`Not authorized as a ${roles.join(' or ')}`);
    }
  };
};

module.exports = { protect, admin, checkRole };