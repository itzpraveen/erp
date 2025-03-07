const redisCache = require('../utils/cache/redisCache');
const config = require('../config/config');
const logger = require('../utils/logger');

// Cache durations in seconds
const CACHE_DURATIONS = {
  SHORT: 60,         // 1 minute
  MEDIUM: 300,       // 5 minutes
  LONG: 1800,        // 30 minutes
  VERY_LONG: 86400,  // 24 hours
};

// Routes that should be cached with their durations
const CACHED_ROUTES = {
  // Dashboard statistics - medium cache
  '/api/leads/stats': CACHE_DURATIONS.MEDIUM,
  '/api/customers/stats': CACHE_DURATIONS.MEDIUM,
  '/api/projects/stats': CACHE_DURATIONS.MEDIUM,
  '/api/service-requests/stats': CACHE_DURATIONS.MEDIUM,
  
  // Reference data - longer cache
  '/api/users': CACHE_DURATIONS.LONG,
  '/api/leads/customers': CACHE_DURATIONS.LONG,
  
  // Static calculation endpoints - very long cache
  '/api/solar-calculator/options': CACHE_DURATIONS.VERY_LONG,
  '/api/enhanced-solar-calculator/options': CACHE_DURATIONS.VERY_LONG,
};

// Middleware to cache a specific route
const cacheRoute = (prefix, expireSeconds = 300) => {
  return (req, res, next) => {
    // Skip if Redis is not enabled or not in production
    if (!redisCache.isEnabled() || config.nodeEnv !== 'production') {
      return next();
    }
    
    // Skip for non-GET requests
    if (req.method !== 'GET' && req.method !== 'POST') {
      return next();
    }
    
    // Create cache key from prefix and request path + body for POST or query for GET
    let cacheKey = `${prefix}:${req.originalUrl || req.url}`;
    if (req.method === 'POST' && req.body) {
      // For POST requests, include a hash of the body in the cache key
      const bodyStr = JSON.stringify(req.body);
      cacheKey += `:${Buffer.from(bodyStr).toString('base64').substring(0, 20)}`;
    }
    
    // Try to get from cache
    redisCache.getCache(cacheKey)
      .then(cachedData => {
        if (cachedData) {
          logger.debug(`Cache hit for ${cacheKey}`);
          return res.json(cachedData);
        }
        
        // Cache miss, intercept response to cache
        const originalJson = res.json;
        
        res.json = function(data) {
          // Only cache successful responses
          if (res.statusCode >= 200 && res.statusCode < 300) {
            // Cache response data
            redisCache.setCache(cacheKey, data, expireSeconds)
              .catch(err => logger.error(`Error caching response for ${cacheKey}:`, err));
          }
          
          // Call original json method
          return originalJson.call(this, data);
        };
        
        next();
      })
      .catch(error => {
        logger.error(`Cache middleware error for ${cacheKey}:`, error);
        next();
      });
  };
};

// Middleware to apply caching based on route
const routeCacheMiddleware = (req, res, next) => {
  // Skip if not enabled or not in production
  if (!redisCache.isEnabled() || config.nodeEnv !== 'production') {
    return next();
  }
  
  // Skip for non-GET requests
  if (req.method !== 'GET') {
    return next();
  }
  
  // Get the route path without query parameters
  const routePath = req.originalUrl.split('?')[0];
  
  // Check if route should be cached
  const cacheDuration = CACHED_ROUTES[routePath];
  if (!cacheDuration) {
    return next();
  }
  
  // Apply caching with the configured duration
  const cacheKey = `api:${req.originalUrl}`;
  
  // Try to get from cache
  redisCache.getCache(cacheKey)
    .then(cachedData => {
      if (cachedData) {
        logger.debug(`Cache hit for ${cacheKey}`);
        return res.json(cachedData);
      }
      
      // Cache miss, intercept response to cache
      const originalJson = res.json;
      
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Cache response data in background
          redisCache.setCache(cacheKey, data, cacheDuration)
            .catch(err => logger.error(`Error caching response for ${cacheKey}:`, err));
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    })
    .catch(error => {
      logger.error(`Cache middleware error for ${cacheKey}:`, error);
      next();
    });
};

// Middleware to clear cache for specific patterns when data changes
const clearCacheMiddleware = (patterns) => {
  return async (req, res, next) => {
    // Store the original end method
    const originalEnd = res.end;
    
    // Override the end method
    res.end = async function(...args) {
      // Only clear cache on successful operations (status 2xx)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Only clear cache for non-GET methods that modify data
        if (req.method !== 'GET') {
          try {
            // Clear all specified cache patterns
            for (const pattern of patterns) {
              await redisCache.deleteCacheByPattern(pattern);
              logger.debug(`Cleared cache for pattern: ${pattern}`);
            }
          } catch (error) {
            logger.error('Error clearing cache:', error);
          }
        }
      }
      
      // Call the original end method
      return originalEnd.apply(this, args);
    };
    
    next();
  };
};

module.exports = {
  routeCacheMiddleware,
  clearCacheMiddleware,
  cacheRoute,
  CACHE_DURATIONS
};
