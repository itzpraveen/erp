/**
 * Rate limit middleware configuration for preventing brute force and DOS attacks
 * Enhanced with tiered protection based on endpoint sensitivity
 */
const rateLimit = require('express-rate-limit');
const { ApiError } = require('./errorMiddleware');
const logger = require('../utils/logger');

// Get environment variables or use defaults
const WINDOW_MS = process.env.RATE_LIMIT_WINDOW ? parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000 : 15 * 60 * 1000; // Default 15 minutes
const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX) || 100; // Default 100 requests per window
const STORE_LIMIT = parseInt(process.env.RATE_LIMIT_STORE_MAX) || 10000; // Maximum number of IPs in store

// Enhanced handler with logging and detailed response
const rateLimitHandler = (req, res, next, options) => {
  // Log the rate limit event
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    path: req.path,
    method: req.method,
    limit: options.max,
    window: options.windowMs / 60000 + ' minutes'
  });

  // Set the proper status code
  res.status(429);
  
  // Return a more descriptive error in the standard error format
  res.json({
    status: 'error',
    message: options.message || 'Too many requests, please try again later',
    retryAfter: Math.ceil(options.windowMs / 1000 / 60) + ' minutes'
  });
};

// Generic API rate limiter
const apiLimiter = rateLimit({
  windowMs: WINDOW_MS,
  max: MAX_REQUESTS,
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP. API rate limit exceeded.',
  handler: rateLimitHandler,
  skip: (req, res) => process.env.NODE_ENV === 'development', // Skip in development for easier testing
  keyGenerator: (req) => {
    // Use forwarded IP if behind proxy, or direct IP
    return req.headers['x-forwarded-for'] || req.ip;
  },
  // Using the built-in memory store (without explicit store option)
  skipSuccessfulRequests: false,
  standardHeaders: 'draft-6' // Use standardized headers
});

// Auth rate limiter - more strict for login attempts to prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login attempts per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts detected. For security, please wait 15 minutes before trying again.',
  handler: rateLimitHandler,
  // More strict - do not skip even in development
  keyGenerator: (req) => {
    // Consider both IP and username when rate limiting login attempts
    // This prevents an attacker from trying different usernames from the same IP
    const username = req.body.email || req.body.username || 'unknown';
    return `${req.ip}:${username.toLowerCase()}`;
  },
  skipSuccessfulRequests: false, // Count all requests, even successful ones
  // Using the built-in memory store
});

// Admin route rate limiter - protection for sensitive admin operations
const adminLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60, // 60 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Rate limit exceeded for administrative operations. Please try again later.',
  handler: rateLimitHandler,
  skip: (req, res) => process.env.NODE_ENV === 'development', // Skip in development
  // Using the built-in memory store
});

// Create account limiter to prevent mass account creation
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour window
  max: 5, // 5 account creations per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Account creation limit reached. Please try again after an hour.',
  handler: rateLimitHandler,
  // Do not skip even in development
  skipSuccessfulRequests: false, // Count all account creation attempts
  // Using the built-in memory store
});

// Special limiter for sensitive operations like password resets
const sensitiveOpLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 operations per hour (very strict)
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many sensitive operations requested. Please try again later.',
  handler: rateLimitHandler,
  // Do not skip even in development
});

// API endpoints with higher limits (e.g., read operations)
const readOpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 200, // 200 requests per 5 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Read operation rate limit exceeded. Please slow down your requests.',
  handler: rateLimitHandler,
  skip: (req, res) => process.env.NODE_ENV === 'development', // Skip in development
  // Using the built-in memory store
});

// Write operation limiter (for create/update/delete)
const writeOpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 60, // 60 write operations per 10 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Write operation rate limit exceeded. Please slow down your requests.',
  handler: rateLimitHandler,
  skip: (req, res) => process.env.NODE_ENV === 'development', // Skip in development
  // Using the built-in memory store
  skipSuccessfulRequests: false
});

module.exports = {
  apiLimiter,
  authLimiter,
  adminLimiter,
  createAccountLimiter,
  sensitiveOpLimiter,
  readOpLimiter,
  writeOpLimiter,
  // Helper method to apply correct limiter based on request method
  methodBasedLimiter: (req, res, next) => {
    // Apply appropriate rate limiter based on HTTP method
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
      return readOpLimiter(req, res, next);
    } else {
      return writeOpLimiter(req, res, next);
    }
  }
};