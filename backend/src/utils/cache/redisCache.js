const { createClient } = require('redis');
const config = require('../../config/config');
const logger = require('../logger');

// Create Redis client if configured
let redisClient = null;
let redisEnabled = false;

// Initialize Redis client
const initRedisClient = async () => {
  if (!config.redis.uri) {
    logger.info('Redis URI not provided, caching disabled');
    return false;
  }

  try {
    // Create Redis client
    redisClient = createClient({
      url: config.redis.uri,
      password: config.redis.password,
      socket: {
        reconnectStrategy: (retries) => {
          // Maximum retry delay is 10 seconds
          return Math.min(retries * 100, 10000);
        }
      }
    });

    // Add error handler
    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
      redisEnabled = false;
    });

    // Add reconnect handler
    redisClient.on('reconnecting', () => {
      logger.info('Redis client reconnecting...');
    });

    // Add connect handler
    redisClient.on('connect', () => {
      logger.info('Redis client connected');
      redisEnabled = true;
    });

    // Connect to Redis
    await redisClient.connect();
    
    logger.info('Redis cache initialized successfully');
    redisEnabled = true;
    return true;
  } catch (error) {
    logger.error('Failed to initialize Redis cache:', error);
    redisEnabled = false;
    return false;
  }
};

// Get data from cache
const getCache = async (key) => {
  if (!redisEnabled || !redisClient) {
    return null;
  }

  try {
    const cachedData = await redisClient.get(key);
    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  } catch (error) {
    logger.error(`Error getting from cache key ${key}:`, error);
    return null;
  }
};

// Set data in cache with expiration
const setCache = async (key, data, expireSeconds = 300) => {
  if (!redisEnabled || !redisClient) {
    return false;
  }

  try {
    await redisClient.set(key, JSON.stringify(data), {
      EX: expireSeconds
    });
    return true;
  } catch (error) {
    logger.error(`Error setting cache key ${key}:`, error);
    return false;
  }
};

// Delete cache by key
const deleteCache = async (key) => {
  if (!redisEnabled || !redisClient) {
    return false;
  }

  try {
    await redisClient.del(key);
    return true;
  } catch (error) {
    logger.error(`Error deleting cache key ${key}:`, error);
    return false;
  }
};

// Delete cache keys by pattern
const deleteCacheByPattern = async (pattern) => {
  if (!redisEnabled || !redisClient) {
    return false;
  }

  try {
    // Get all keys matching the pattern
    const keys = await redisClient.keys(pattern);
    
    if (keys && keys.length > 0) {
      // Delete all matching keys
      await redisClient.del(keys);
      logger.debug(`Deleted ${keys.length} cache keys matching pattern: ${pattern}`);
    }
    
    return true;
  } catch (error) {
    logger.error(`Error deleting cache keys by pattern ${pattern}:`, error);
    return false;
  }
};

// Cache middleware for Express routes
const cacheMiddleware = (keyPrefix, expireSeconds = 300) => {
  return async (req, res, next) => {
    // Skip caching if Redis is not enabled
    if (!redisEnabled || !redisClient) {
      return next();
    }

    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Create cache key from prefix and request path
    const cacheKey = `${keyPrefix}:${req.originalUrl || req.url}`;
    
    try {
      // Try to get data from cache
      const cachedData = await getCache(cacheKey);
      
      if (cachedData) {
        logger.debug(`Cache hit for ${cacheKey}`);
        return res.json(cachedData);
      }
      
      // Cache miss, continue to handler but intercept response
      const originalJson = res.json;
      
      res.json = function(data) {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          // Cache response data
          setCache(cacheKey, data, expireSeconds)
            .catch(err => logger.error(`Error caching response for ${cacheKey}:`, err));
        }
        
        // Call original json method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      logger.error(`Cache middleware error for ${cacheKey}:`, error);
      next();
    }
  };
};

// Export functions
module.exports = {
  initRedisClient,
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
  cacheMiddleware,
  isEnabled: () => redisEnabled
};
