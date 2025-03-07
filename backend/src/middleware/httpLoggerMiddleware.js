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
 * HTTP request logger middleware
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const httpLogger = (req, res, next) => {
  // Skip logging for certain paths
  if (req.path === '/health' || req.path === '/favicon.ico') {
    return next();
  }
  
  // Get start time
  const start = process.hrtime();
  const startTime = new Date();
  
  // Log request
  logger.info(`${req.method} ${req.originalUrl}`, {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.connection.remoteAddress,
    body: req.method !== 'GET' ? req.body : undefined,
    query: req.query,
    params: req.params,
  });
  
  // Override end method to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    // Calculate response time
    const responseTime = calculateResponseTime(start);
    
    // Restore original end function
    res.end = originalEnd;
    
    // Call original end function
    res.end(chunk, encoding);
    
    // Log response
    logger.http(req, res, responseTime);
  };
  
  next();
};

module.exports = httpLogger;