/**
 * Caching middleware for Express routes
 * Provides route-level caching using the cacheManager
 */
const cacheManager = require('../utils/cacheManager');
const logger = require('../utils/logger');

/**
 * Creates a middleware that caches the response of a route
 * @param {string} prefix - Cache key prefix
 * @param {number} ttl - Time to live in seconds
 * @returns {Function} Express middleware function
 */
const cacheRoute = (prefix, ttl = 300) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }
    
    // Create cache key based on URL and query parameters
    const cacheKey = cacheManager.createKey(prefix, {
      url: req.originalUrl,
      user: req.user?.id // Include user ID to isolate caches per user
    });
    
    // Try to get cached response
    const cachedData = cacheManager.get(cacheKey);
    if (cachedData) {
      logger.debug(`Cache hit for ${req.originalUrl}`, { cacheKey });
      
      // Restore response headers
      if (cachedData.headers) {
        Object.entries(cachedData.headers).forEach(([key, value]) => {
          res.set(key, value);
        });
      }
      
      // Send cached response
      return res.status(cachedData.status).send(cachedData.data);
    }
    
    // Cache miss, continue processing
    logger.debug(`Cache miss for ${req.originalUrl}`, { cacheKey });
    
    // Store original methods to intercept response
    const originalSend = res.send;
    const originalJson = res.json;
    const originalStatus = res.status;
    
    // Track response status
    let statusCode = 200;
    res.status = function(code) {
      statusCode = code;
      return originalStatus.apply(res, arguments);
    };

    // Intercept response.send
    res.send = function(body) {
      // Don't cache error responses
      if (statusCode >= 200 && statusCode < 400) {
        const headers = res.getHeaders();
        const cachedResponse = {
          data: body,
          status: statusCode,
          headers: headers,
          timestamp: Date.now()
        };
        
        // Store in cache
        cacheManager.set(cacheKey, cachedResponse, ttl);
        logger.debug(`Cached response for ${req.originalUrl}`, { cacheKey, ttl });
      }

      return originalSend.apply(res, arguments);
    };

    // Intercept response.json
    res.json = function(body) {
      // Don't cache error responses
      if (statusCode >= 200 && statusCode < 400) {
        const headers = res.getHeaders();
        const cachedResponse = {
          data: body,
          status: statusCode,
          headers: headers,
          timestamp: Date.now()
        };
        
        // Store in cache
        cacheManager.set(cacheKey, cachedResponse, ttl);
        logger.debug(`Cached response for ${req.originalUrl}`, { cacheKey, ttl });
      }

      return originalJson.apply(res, arguments);
    };

    next();
  };
};

/**
 * Creates a middleware that clears cache based on a prefix
 * @param {string} prefix - Cache key prefix to clear
 * @returns {Function} Express middleware function
 */
const clearCache = (prefix) => {
  return (req, res, next) => {
    // Store original methods to intercept response
    const originalSend = res.send;
    const originalJson = res.json;
    const originalEnd = res.end;
    
    // Only clear cache after successful response
    const wrapResponse = (method) => {
      return function() {
        // If response is successful (2xx status)
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Clear all caches with this prefix
          const stats = cacheManager.stats();
          const keysToDelete = stats.keys.filter(key => key.startsWith(prefix));
          
          keysToDelete.forEach(key => cacheManager.del(key));
          logger.debug(`Cleared ${keysToDelete.length} cache entries with prefix ${prefix}`);
        }
        
        return method.apply(res, arguments);
      };
    };
    
    // Replace response methods
    res.send = wrapResponse(originalSend);
    res.json = wrapResponse(originalJson);
    res.end = wrapResponse(originalEnd);
    
    next();
  };
};

module.exports = {
  cacheRoute,
  clearCache
};