const redis = require('redis');
const { promisify } = require('util');

let redisClient;
let getAsync;
let setAsync;
let delAsync;

// Initialize Redis client
const initRedis = async () => {
  try {
    // Check if Redis URI is provided
    const redisURI = process.env.REDIS_URI || 'redis://localhost:6379';
    
    const options = {
      url: redisURI,
      socket: {
        reconnectStrategy: (retries) => {
          // Reconnect with exponential backoff
          return Math.min(retries * 50, 2000);
        }
      }
    };
    
    // Add password if provided
    if (process.env.REDIS_PASSWORD) {
      options.password = process.env.REDIS_PASSWORD;
    }
    
    // Create Redis client
    redisClient = redis.createClient(options);
    
    // Promisify Redis methods
    getAsync = promisify(redisClient.get).bind(redisClient);
    setAsync = promisify(redisClient.set).bind(redisClient);
    delAsync = promisify(redisClient.del).bind(redisClient);
    
    // Event handlers
    redisClient.on('error', (err) => {
      console.error('Redis error:', err);
    });
    
    redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });
    
    redisClient.on('reconnecting', () => {
      console.log('Reconnecting to Redis...');
    });
    
    // Connect to Redis
    await redisClient.connect();
    
    return redisClient;
  } catch (error) {
    console.error('Redis initialization error:', error);
    
    // Return dummy implementations if Redis fails to connect
    return {
      get: async () => null,
      set: async () => null,
      del: async () => null,
      isReady: false
    };
  }
};

// Cache middleware function
const cacheMiddleware = (duration) => {
  return async (req, res, next) => {
    // Skip cache in development mode if requested
    if (process.env.NODE_ENV === 'development' && req.query.noCache === 'true') {
      return next();
    }
    
    if (!redisClient || !redisClient.isReady) {
      return next();
    }
    
    // Create a unique key based on the route and any query params
    const key = `__express__${req.originalUrl || req.url}`;
    
    try {
      // Try to get cached response
      const cachedResponse = await redisClient.get(key);
      
      if (cachedResponse) {
        // If found, send the cached response
        const parsedResponse = JSON.parse(cachedResponse);
        return res.json(parsedResponse);
      }
      
      // If not found, continue to the route handler
      // Store the original res.json method
      const originalJson = res.json;
      
      // Override res.json method to cache the response
      res.json = function (data) {
        // Store in cache
        redisClient.set(key, JSON.stringify(data), {
          EX: duration // Set expiration time in seconds
        });
        
        // Call the original method
        return originalJson.call(this, data);
      };
      
      next();
    } catch (error) {
      console.error('Redis cache error:', error);
      next();
    }
  };
};

// Cache utility functions
const cacheUtils = {
  // Set a value in the cache
  set: async (key, value, expirySeconds = 3600) => {
    if (!redisClient || !redisClient.isReady) {
      return false;
    }
    
    try {
      await redisClient.set(key, JSON.stringify(value), {
        EX: expirySeconds
      });
      return true;
    } catch (error) {
      console.error('Redis cache set error:', error);
      return false;
    }
  },
  
  // Get a value from the cache
  get: async (key) => {
    if (!redisClient || !redisClient.isReady) {
      return null;
    }
    
    try {
      const cachedValue = await redisClient.get(key);
      return cachedValue ? JSON.parse(cachedValue) : null;
    } catch (error) {
      console.error('Redis cache get error:', error);
      return null;
    }
  },
  
  // Delete a value from the cache
  del: async (key) => {
    if (!redisClient || !redisClient.isReady) {
      return false;
    }
    
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('Redis cache del error:', error);
      return false;
    }
  },
  
  // Clear cache for a specific pattern
  clearPattern: async (pattern) => {
    if (!redisClient || !redisClient.isReady) {
      return false;
    }
    
    try {
      // Get all keys matching the pattern
      const keys = await redisClient.keys(pattern);
      
      if (keys.length > 0) {
        // Delete all matching keys
        await redisClient.del(keys);
      }
      
      return true;
    } catch (error) {
      console.error('Redis cache clearPattern error:', error);
      return false;
    }
  }
};

module.exports = {
  initRedis,
  cacheMiddleware,
  cacheUtils
};