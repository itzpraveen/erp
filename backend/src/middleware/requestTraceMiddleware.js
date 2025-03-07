const crypto = require('crypto');
const logger = require('../utils/logger');

/**
 * Middleware to add request tracing to help correlate logs and errors
 * This is essential for production debugging and monitoring
 */
const requestTraceMiddleware = (req, res, next) => {
  // Generate a unique request ID for tracing
  const traceId = crypto.randomBytes(16).toString('hex');
  
  // Add traceId to the request object so it's available throughout the request lifecycle
  req.traceId = traceId;
  
  // Set trace ID in response headers for client-side debugging
  res.setHeader('X-Trace-ID', traceId);
  
  // Log the incoming request with trace ID
  const logLevel = req.method === 'GET' ? 'debug' : 'info';
  
  logger[logLevel](`Incoming request: ${req.method} ${req.originalUrl}`, {
    traceId,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip || req.headers['x-forwarded-for'] || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    // Don't log auth headers or sensitive query params
    headers: sanitizeHeaders(req.headers),
    query: sanitizeQueryParams(req.query)
  });
  
  // Track response time
  const startTime = Date.now();
  
  // Listen for request finish to log the response status and time
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    
    // Log request completion details
    const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : logLevel;
    
    logger[level](`Request completed: ${req.method} ${req.originalUrl} ${statusCode} ${duration}ms`, {
      traceId,
      method: req.method,
      url: req.originalUrl,
      statusCode,
      duration,
      contentLength: res.getHeader('content-length') || 0
    });
  });
  
  next();
};

/**
 * Sanitize headers to remove sensitive information like auth tokens
 */
const sanitizeHeaders = (headers) => {
  if (!headers) return {};
  
  const sanitized = { ...headers };
  
  // Remove sensitive headers
  const sensitiveHeaders = [
    'authorization',
    'cookie',
    'set-cookie',
    'x-auth-token',
    'api-key',
    'api_key',
    'password',
    'secret'
  ];
  
  sensitiveHeaders.forEach(header => {
    if (sanitized[header]) {
      sanitized[header] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

/**
 * Sanitize query parameters to remove sensitive information
 */
const sanitizeQueryParams = (query) => {
  if (!query) return {};
  
  const sanitized = { ...query };
  
  // Remove sensitive query parameters
  const sensitiveParams = [
    'password',
    'token',
    'api_key',
    'apiKey',
    'secret',
    'auth',
    'credentials'
  ];
  
  sensitiveParams.forEach(param => {
    if (sanitized[param]) {
      sanitized[param] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

module.exports = requestTraceMiddleware;