/**
 * CSRF Protection Middleware
 * Implements Double Submit Cookie pattern for CSRF protection
 */
const crypto = require('crypto');
const logger = require('../utils/logger');

// Generate a secure random token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Middleware to set CSRF token in cookie if not exists
const setCsrfToken = (req, res, next) => {
  // Only set CSRF token if user is authenticated
  if (req.user) {
    // Check if token already exists in cookies
    if (!req.cookies.csrfToken) {
      const token = generateToken();
      
      // Set secure cookie options
      const cookieOptions = {
        httpOnly: false, // Must be accessible by JavaScript
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/'
      };
      
      // Set token in cookie
      res.cookie('csrfToken', token, cookieOptions);
      
      logger.debug('Set new CSRF token', { 
        userId: req.user._id,
        masked: `${token.substring(0, 4)}...${token.substring(token.length - 4)}`
      });
    }
  }
  
  next();
};

// Middleware to verify CSRF token on state-changing requests
const verifyCsrfToken = (req, res, next) => {
  // Skip CSRF check for non-state-changing methods
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Skip CSRF check for unauthenticated routes
  if (!req.user) {
    return next();
  }
  
  // Skip during development if CSRF_CHECK_DISABLED is set
  if (process.env.NODE_ENV === 'development' && process.env.CSRF_CHECK_DISABLED === 'true') {
    logger.warn('CSRF check disabled in development mode');
    return next();
  }
  
  const cookieToken = req.cookies.csrfToken;
  const headerToken = req.headers['x-csrf-token'];
  
  // Verify token exists in both cookie and header
  if (!cookieToken || !headerToken) {
    logger.warn('CSRF token missing', {
      hasCookieToken: !!cookieToken,
      hasHeaderToken: !!headerToken,
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    
    return res.status(403).json({
      status: 'error',
      message: 'CSRF token validation failed. Please refresh the page and try again.'
    });
  }
  
  // Verify tokens match (constant time comparison to prevent timing attacks)
  if (!crypto.timingSafeEqual(Buffer.from(cookieToken), Buffer.from(headerToken))) {
    logger.warn('CSRF token mismatch', {
      path: req.path,
      method: req.method,
      ip: req.ip
    });
    
    return res.status(403).json({
      status: 'error',
      message: 'Invalid security token. Please refresh the page and try again.'
    });
  }
  
  next();
};

module.exports = {
  setCsrfToken,
  verifyCsrfToken
};
