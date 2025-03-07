const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../utils/logger');

/**
 * Connect to MongoDB with retry logic
 * @returns {Promise<mongoose.Connection>} MongoDB connection
 */
const connectDB = async (retries = 5, interval = 5000) => {
  try {
    logger.info('Attempting to connect to MongoDB...');
    
    if (!config.db.uri) {
      throw new Error('MongoDB connection string is missing. Check your environment variables.');
    }
    
    const conn = await mongoose.connect(config.db.uri, config.db.options);
    
    // Set up event listeners for connection
    mongoose.connection.on('connected', () => {
      logger.info(`MongoDB connected successfully to ${hideConnectionString(config.db.uri)}`);
    });
    
    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed due to application termination');
      process.exit(0);
    });
    
    logger.info(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // Implement retry logic
    if (retries > 0) {
      logger.warn(`MongoDB connection failed. Retrying in ${interval/1000}s... (${retries} attempts left)`);
      logger.error(`Connection error: ${error.message}`);
      
      // Wait for the specified interval
      await new Promise(resolve => setTimeout(resolve, interval));
      
      // Retry with one less retry attempt
      return connectDB(retries - 1, interval);
    }
    
    // No more retries left
    logger.error(`MongoDB connection failed after multiple attempts: ${error.message}`);
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
