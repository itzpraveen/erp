/**
 * HTTP request logger middleware
 * Logs HTTP requests and responses
 */
const logger = require('../utils/logger');

/**
 * Calculates response time
 * @param {number} start - Start time in milliseconds
 * @returns {number} Response time in milliseconds
 */
const calculateResponseTime = (start) => {
  const NS_PER_SEC = 1e9; // nanoseconds per second
  const NS_TO_MS = 1e6; // nanoseconds to milliseconds
  const diff = process.hrtime(start);
  
  return (diff[0] * NS_PER_SEC + diff[1]) / NS_TO_MS;
};

/**
 * Sanitize request body for logging
 * @param {Object} body - Request body
 * @returns {Object} Sanitized body
 */
const sanitizeBody = (body) => {
  if (!body) return {};
  
  // Create a shallow copy
  const sanitized = { ...body };
  
  // Remove sensitive fields
  const sensitiveFields = ['password', 'confirmPassword', 'currentPassword', 'token', 'accessToken', 'refreshToken'];
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

/**
 * HTTP request logger middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const httpLogger = (req, res, next) => {
  // Skip logging for static files, assets and health checks to reduce noise
  if (
    req.path === '/health' || 
    req.path === '/favicon.ico' ||
    req.path.startsWith('/static/') ||
    req.path.startsWith('/assets/')
  ) {
    return next();
  }
  
  // Get start time
  const start = process.hrtime();
  
  // Prepare request data for logging
  const logData = {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    query: req.query || {},
    params: req.params || {}
  };
  
  // Only log body for non-GET requests and sanitize sensitive data
  if (req.method !== 'GET' && req.body) {
    logData.body = sanitizeBody(req.body);
  }
  
  // Log the incoming request
  logger.info(`${req.method} ${req.originalUrl}`, logData);
  
  // Store the original end function
  const originalEnd = res.end;
  
  // Override end method to log response
  res.end = function(chunk, encoding) {
    // Calculate response time
    const responseTime = calculateResponseTime(start);
    
    // Restore original end function
    res.end = originalEnd;
    
    // Call original end function
    res.end(chunk, encoding);
    
    try {
      // Log the response using our http logger
      logger.http(req, res, responseTime);
    } catch (error) {
      // Fallback to standard info logging if http logger fails
      logger.error('Error in HTTP logger', error);
      
      // Log basic response info
      const status = res.statusCode;
      const logLevel = status >= 400 ? 'error' : 'info';
      
      logger[logLevel](`Response: ${req.method} ${req.originalUrl} ${status} ${responseTime.toFixed(2)}ms`);
    }
  };
  
  next();
};

module.exports = httpLogger;