const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB with enhanced retry logic and better error handling
 * @returns {Promise<mongoose.Connection>} MongoDB connection
 */
const connectDB = async (retries = 5, interval = 5000) => {
  try {
    logger.info('Attempting to connect to MongoDB...');
    
    // Validate connection string
    if (!config.db.uri) {
      throw new Error('MongoDB connection string is missing. Check your environment variables.');
    }
    
    // Enhanced connection options with longer timeouts for Railway environment
    const connectionOptions = {
      ...config.db.options,
      serverSelectionTimeoutMS: 30000,    // Increase from default to 30s
      connectTimeoutMS: 30000,            // Increase connection timeout
      socketTimeoutMS: 45000,             // Increase socket timeout
      heartbeatFrequencyMS: 10000,        // More frequent heartbeats
      family: 4                           // Force IPv4 (can help with some network issues)
    };
    
    // Attempt to connect
    const conn = await mongoose.connect(config.db.uri, connectionOptions);
    
    // Set up connection event listeners
    mongoose.connection.on('connected', () => {
      logger.info(`MongoDB connected successfully to ${hideConnectionString(config.db.uri)}`);
    });
    
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
      
      // If the error is related to authentication, log more details (but not credentials)
      if (err.name === 'MongoServerError' && [18, 8000, 18000].includes(err.code)) {
        logger.error('MongoDB authentication failed. Please check your credentials.');
      }
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. The application will try to reconnect automatically.');
    });
    
    // Log successful connection
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // Log detailed error information
    logger.error(`MongoDB connection error (attempt ${6 - retries} of 5):`, error);
    
    // Provide more specific error messages based on error type
    if (error.name === 'MongoServerSelectionError') {
      logger.error('Could not connect to any MongoDB servers. Check your network or MongoDB service status.');
    } else if (error.name === 'MongoParseError') {
      logger.error('Invalid MongoDB connection string format.');
    } else if (error.message.includes('ENOTFOUND')) {
      logger.error('MongoDB hostname could not be resolved. Check your connection string.');
    } else if (error.message.includes('ECONNREFUSED')) {
      logger.error('Connection refused by MongoDB server. Make sure MongoDB is running and accessible.');
    } else if (error.message.includes('Authentication failed')) {
      logger.error('MongoDB authentication failed. Check your username and password.');
    }
    
    // Implement retry logic with exponential backoff
    if (retries > 0) {
      // Calculate backoff interval - increasing with each retry
      const backoffInterval = interval * (1.5 ** (5 - retries));
      const nextInterval = Math.min(backoffInterval, 30000); // Cap at 30 seconds
      
      logger.warn(`MongoDB connection retry in ${(nextInterval/1000).toFixed(1)}s... (${retries} attempts left)`);
      
      // Wait for the backoff interval
      await new Promise(resolve => setTimeout(resolve, nextInterval));
      
      // Retry with one less retry attempt and adjusted interval
      return connectDB(retries - 1, interval);
    }
    
    // No more retries left
    logger.error('MongoDB connection failed after multiple attempts. The application may not function correctly.');
    
    // In production, we may want to continue running even without DB access
    // to allow the service to start and retry DB connections in the background
    if (process.env.NODE_ENV === 'production') {
      logger.warn('Running in production mode with no database connection. Will retry connections in the background.');
      
      // Set up a background retry process
      setTimeout(() => {
        logger.info('Attempting background reconnection to MongoDB...');
        connectDB(5, 10000).catch(err => {
          logger.error('Background reconnection attempt failed:', err.message);
        });
      }, 60000); // Wait 1 minute before starting background reconnection
      
      // Return a dummy connection to allow app to start
      return { connection: { host: 'none', readyState: 0 } };
    }
    
    // In development, throw the error to crash fast and fix issues
    throw error;
  }
};

/**
 * Hides sensitive information in connection string for logging
 * @param {string} connectionString - MongoDB connection string
 * @returns {string} - Sanitized connection string
 */
const hideConnectionString = (connectionString) => {
  try {
    if (!connectionString) return 'undefined';
    
    // If it's not a URL format, handle standard MongoDB connection string
    if (!connectionString.includes('://')) {
      return connectionString.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
    }
    
    // Create a URL object from the connection string
    const url = new URL(connectionString);
    
    // Hide username and password
    if (url.username) {
      url.username = '***';
    }
    if (url.password) {
      url.password = '***';
    }
    
    // Return the sanitized URL string
    return url.toString();
  } catch (error) {
    // If parsing fails, return a generic safe string
    return 'mongodb://**redacted**/database';
  }
};

module.exports = connectDB;