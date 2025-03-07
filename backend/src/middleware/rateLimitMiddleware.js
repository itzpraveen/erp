const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

// Store for tracking IP addresses that exceed limits to implement adaptive rate limiting
const offenderRegistry = new Map();

// Helper for logging rate limit events
const logRateLimitEvent = (req, res, options, next) => {
  if (!res.locals.rateLimit) return next();
  
  const { current, limit, remaining } = res.locals.rateLimit;
  
  // If the user is close to hitting their limit (e.g., 80% used), log it
  if (remaining <= Math.floor(limit * 0.2)) {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    logger.warn(`Rate limit approaching: ${current}/${limit} requests`, {
      ip: ipAddress,
      path: req.originalUrl,
      method: req.method,
      remaining,
      userAgent: req.headers['user-agent'] || 'unknown'
    });
    
    // Add to offender registry if they've hit the limit
    if (remaining === 0) {
      const now = Date.now();
      const offenderData = offenderRegistry.get(ipAddress) || { count: 0, timestamp: now };
      offenderData.count += 1;
      offenderData.timestamp = now;
      offenderRegistry.set(ipAddress, offenderData);
      
      logger.error(`Rate limit exceeded for IP: ${ipAddress}`, {
        path: req.originalUrl,
        method: req.method,
        count: offenderData.count,
        userAgent: req.headers['user-agent'] || 'unknown'
      });
    }
  }
  
  next();
};

// Clean up offender registry periodically (every hour)
setInterval(() => {
  const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
  for (const [ip, data] of offenderRegistry.entries()) {
    if (data.timestamp < cutoff) {
      offenderRegistry.delete(ip);
    }
  }
}, 60 * 60 * 1000);

// Function to dynamically set limit based on IP's history
const getDynamicLimit = (req) => {
  const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  const offenderData = offenderRegistry.get(ipAddress);
  
  // If this IP has exceeded limits multiple times, reduce their limit
  if (offenderData) {
    // Exponentially reduce the limit based on offense count
    const reductionFactor = Math.min(Math.pow(2, offenderData.count), 16);
    return Math.floor(100 / reductionFactor); // Base limit is 100
  }
  
  return 100; // Default limit
};

// General API rate limiter - more generous
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: getDynamicLimit, // Dynamic limit based on IP history
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  handler: (req, res, next, options) => {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    logger.warn(`Rate limit exceeded: ${ipAddress}`, {
      path: req.originalUrl,
      method: req.method,
      userAgent: req.headers['user-agent'] || 'unknown'
    });
    res.status(options.statusCode).json(options.message);
  },
  skip: (req, res) => req.originalUrl.includes('/health'), // Don't rate limit health checks
  keyGenerator: (req) => req.ip || req.headers['x-forwarded-for'] || 'unknown'
});

// Stricter rate limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many login attempts, please try again later',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Auth rate limit exceeded: ${req.ip}`, {
      path: req.originalUrl,
      method: req.method
    });
    res.status(options.statusCode).json(options.message);
  }
});

// Very strict rate limiter for admin endpoints
const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // 30 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many admin requests, please try again later',
    code: 'ADMIN_RATE_LIMIT_EXCEEDED'
  },
  handler: (req, res, next, options) => {
    logger.warn(`Admin rate limit exceeded: ${req.ip}`, {
      path: req.originalUrl,
      method: req.method
    });
    res.status(options.statusCode).json(options.message);
  }
});

// Middleware to add rate limit headers and logging
const rateLimitMiddleware = (req, res, next) => {
  // Add rate limit tracking info to response
  res.on('finish', () => {
    if (res.locals.rateLimit) {
      logRateLimitEvent(req, res, {}, () => {});
    }
  });
  
  next();
};

module.exports = {
  apiLimiter,
  authLimiter,
  adminLimiter,
  rateLimitMiddleware
};