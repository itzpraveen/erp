/**
 * In-memory cache manager service
 * 
 * This service provides a simple in-memory cache with TTL support.
 * It will be used until Redis is available in the environment.
 */

const logger = require('./logger');

// Cache storage
const cache = new Map();
const cacheTTL = new Map();

// Default TTL in seconds
const DEFAULT_TTL = 60 * 5; // 5 minutes

/**
 * Set a value in the cache
 * @param {string} key - Cache key
 * @param {any} value - Value to cache
 * @param {number} ttl - Time to live in seconds (optional)
 */
const set = (key, value, ttl = DEFAULT_TTL) => {
  try {
    // Store value in cache
    cache.set(key, value);
    
    // Set expiration
    const expiration = Date.now() + (ttl * 1000);
    cacheTTL.set(key, expiration);
    
    logger.debug(`Cache SET: ${key}`, { ttl });
    
    // Set up auto-cleanup after TTL
    setTimeout(() => {
      if (cache.has(key)) {
        cache.delete(key);
        cacheTTL.delete(key);
        logger.debug(`Cache EXPIRED: ${key}`);
      }
    }, ttl * 1000);
    
    return true;
  } catch (error) {
    logger.error(`Cache SET error for key ${key}`, { error: error.message });
    return false;
  }
};

/**
 * Get a value from the cache
 * @param {string} key - Cache key
 * @returns {any|null} - Cached value or null if not found/expired
 */
const get = (key) => {
  try {
    // Check if key exists and is not expired
    if (cache.has(key)) {
      const expiration = cacheTTL.get(key);
      
      // Check if expired
      if (expiration > Date.now()) {
        logger.debug(`Cache HIT: ${key}`);
        return cache.get(key);
      } else {
        // Cleanup expired key
        cache.delete(key);
        cacheTTL.delete(key);
        logger.debug(`Cache EXPIRED: ${key}`);
      }
    }
    
    logger.debug(`Cache MISS: ${key}`);
    return null;
  } catch (error) {
    logger.error(`Cache GET error for key ${key}`, { error: error.message });
    return null;
  }
};

/**
 * Delete a value from the cache
 * @param {string} key - Cache key
 * @returns {boolean} - True if deleted, false otherwise
 */
const del = (key) => {
  try {
    logger.debug(`Cache DELETE: ${key}`);
    cacheTTL.delete(key);
    return cache.delete(key);
  } catch (error) {
    logger.error(`Cache DELETE error for key ${key}`, { error: error.message });
    return false;
  }
};

/**
 * Clear all values from the cache
 * @returns {boolean} - True if cleared, false otherwise
 */
const clear = () => {
  try {
    logger.debug('Cache CLEAR');
    cache.clear();
    cacheTTL.clear();
    return true;
  } catch (error) {
    logger.error('Cache CLEAR error', { error: error.message });
    return false;
  }
};

/**
 * Get the number of items in the cache
 * @returns {number} - Number of cache items
 */
const size = () => {
  return cache.size;
};

/**
 * Get cache statistics
 * @returns {Object} - Cache statistics
 */
const stats = () => {
  const now = Date.now();
  const expired = Array.from(cacheTTL.entries())
    .filter(([key, expiry]) => expiry <= now)
    .length;
  
  return {
    total: cache.size,
    expired,
    active: cache.size - expired,
    keys: Array.from(cache.keys())
  };
};

/**
 * Wrap an async function with caching
 * @param {Function} fn - Async function to cache
 * @param {string} key - Cache key
 * @param {number} ttl - Time to live in seconds
 * @returns {Promise<any>} - Function result, either from cache or live execution
 */
const wrap = async (fn, key, ttl = DEFAULT_TTL) => {
  // Try to get from cache first
  const cachedValue = get(key);
  if (cachedValue !== null) {
    return cachedValue;
  }
  
  // If not in cache, execute function
  try {
    const result = await fn();
    
    // Cache the result
    set(key, result, ttl);
    
    return result;
  } catch (error) {
    logger.error(`Cache wrap error for key ${key}`, { error: error.message });
    throw error; // Re-throw to let caller handle it
  }
};

/**
 * Create a cache key based on parameters
 * @param {string} prefix - Key prefix
 * @param {Object} params - Parameters to include in key
 * @returns {string} - Cache key
 */
const createKey = (prefix, params = {}) => {
  const paramString = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${typeof value === 'object' ? JSON.stringify(value) : value}`)
    .join('&');
  
  return `${prefix}${paramString ? `:${paramString}` : ''}`;
};

// Set up periodic cleanup of expired items
const CLEANUP_INTERVAL = 60 * 1000; // 1 minute
setInterval(() => {
  const now = Date.now();
  let cleanupCount = 0;
  
  // Find and remove expired items
  for (const [key, expiry] of cacheTTL.entries()) {
    if (expiry <= now) {
      cache.delete(key);
      cacheTTL.delete(key);
      cleanupCount++;
    }
  }
  
  if (cleanupCount > 0) {
    logger.debug(`Cache cleanup: removed ${cleanupCount} expired items`);
  }
}, CLEANUP_INTERVAL);

module.exports = {
  set,
  get,
  del,
  clear,
  size,
  stats,
  wrap,
  createKey
};