const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

/**
 * Enhanced MongoDB connection module with optimized configuration, 
 * advanced error handling, and automatic model indexing
 */
class MongoDBConnector {
  constructor() {
    this.isConnected = false;
    this.connectionPromise = null;
    this.retryAttempts = 0;
    this.maxRetryAttempts = 5;
    this.initialRetryDelay = 1000; // 1 second
    this.maxRetryDelay = 30000; // 30 seconds
  }

  /**
   * Configure MongoDB connection options
   * @param {Object} config - Configuration options
   * @returns {Object} MongoDB connection options
   */
  _getConnectionOptions(config = {}) {
    const isDev = process.env.NODE_ENV === 'development';
    
    // Default options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      // Optimize connection pool based on environment
      maxPoolSize: isDev ? 10 : 20,
      minPoolSize: isDev ? 2 : 5,
      // Set appropriate timeouts
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000
    };
    
    // Add authentication if credentials are provided
    if (process.env.MONGO_USER && process.env.MONGO_PASSWORD) {
      options.user = process.env.MONGO_USER;
      options.pass = process.env.MONGO_PASSWORD;
      options.authSource = process.env.MONGO_AUTH_SOURCE || 'admin';
    }
    
    // Enable SSL in production
    if (process.env.NODE_ENV === 'production') {
      options.ssl = true;
      
      // If SSL cert path is provided, use it
      if (process.env.MONGO_SSL_CA_PATH && fs.existsSync(process.env.MONGO_SSL_CA_PATH)) {
        options.sslCA = process.env.MONGO_SSL_CA_PATH;
      }
    }
    
    // Merge with user-provided config
    return { ...options, ...config };
  }
  
  /**
   * Connect to MongoDB with retry logic
   * @param {String} uri - MongoDB connection URI
   * @param {Object} options - Connection options
   * @returns {Promise<mongoose.Connection>} MongoDB connection
   */
  async connect(uri = null, options = {}) {
    // If already connected, return the connection
    if (this.isConnected) {
      return mongoose.connection;
    }
    
    // If connection is in progress, return the promise
    if (this.connectionPromise) {
      return this.connectionPromise;
    }
    
    const mongoUri = uri || process.env.MONGO_URI || 'mongodb://localhost:27017/erp';
    const connectionOptions = this._getConnectionOptions(options);
    
    // Create connection promise
    this.connectionPromise = new Promise(async (resolve, reject) => {
      try {
        console.log(`Connecting to MongoDB at ${mongoUri.replace(/\/\/([^:]+):[^@]+@/, '//***:***@')}`);
        
        // Connect to MongoDB
        const conn = await mongoose.connect(mongoUri, connectionOptions);
        
        // Set up event listeners after successful connection
        this._setupEventListeners(mongoose.connection);
        
        // Log connection details in non-production environments
        if (process.env.NODE_ENV !== 'production') {
          console.log(`MongoDB Connected: ${conn.connection.host} (${conn.connection.name})`);
        } else {
          console.log('MongoDB Connected successfully');
        }
        
        // Create indexes for all models
        await this._createIndexes();
        
        // Reset retry attempts on successful connection
        this.retryAttempts = 0;
        this.isConnected = true;
        
        resolve(conn.connection);
      } catch (error) {
        console.error(`MongoDB connection error: ${error.message}`);
        
        if (this.retryAttempts < this.maxRetryAttempts) {
          // Calculate retry delay with exponential backoff
          const delay = Math.min(
            this.initialRetryDelay * Math.pow(2, this.retryAttempts),
            this.maxRetryDelay
          );
          
          console.log(`Retrying connection in ${delay / 1000}s (attempt ${this.retryAttempts + 1}/${this.maxRetryAttempts})...`);
          
          // Increment retry attempts
          this.retryAttempts++;
          
          // Wait and retry
          setTimeout(async () => {
            this.connectionPromise = null;
            try {
              const conn = await this.connect(mongoUri, connectionOptions);
              resolve(conn);
            } catch (retryError) {
              reject(retryError);
            }
          }, delay);
        } else {
          console.error(`MongoDB connection failed after ${this.maxRetryAttempts} attempts`);
          this.connectionPromise = null;
          reject(error);
        }
      }
    });
    
    return this.connectionPromise;
  }
  
  /**
   * Set up event listeners for the MongoDB connection
   * @param {mongoose.Connection} connection - MongoDB connection
   */
  _setupEventListeners(connection) {
    // Handle connection errors
    connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      this.isConnected = false;
    });
    
    // Handle disconnection
    connection.on('disconnected', () => {
      console.warn('MongoDB disconnected');
      this.isConnected = false;
      
      // Attempt to reconnect if not in a clean shutdown
      if (!this._isShuttingDown) {
        console.log('Attempting to reconnect to MongoDB...');
        this.connectionPromise = null;
        this.connect();
      }
    });
    
    // Handle reconnection
    connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
      this.isConnected = true;
    });
    
    // Handle process termination
    process.on('SIGINT', this.disconnect.bind(this));
    process.on('SIGTERM', this.disconnect.bind(this));
  }
  
  /**
   * Disconnect from MongoDB
   */
  async disconnect() {
    this._isShuttingDown = true;
    
    if (mongoose.connection.readyState) {
      console.log('Disconnecting from MongoDB...');
      await mongoose.disconnect();
      console.log('MongoDB disconnected');
    }
    
    this.isConnected = false;
    this.connectionPromise = null;
  }
  
  /**
   * Create indexes for all models
   */
  async _createIndexes() {
    try {
      const modelsDir = path.join(__dirname, '../../models');
      
      // Check if models directory exists
      if (!fs.existsSync(modelsDir)) {
        return;
      }
      
      // Get all model files
      const modelFiles = fs.readdirSync(modelsDir).filter(file => 
        file.endsWith('.js') && !file.startsWith('index')
      );
      
      // Load and initialize all models to ensure they're registered
      modelFiles.forEach(file => {
        require(path.join(modelsDir, file));
      });
      
      // Get all registered models
      const modelNames = mongoose.modelNames();
      
      // Check for the model's collection in the database
      console.log('Creating indexes for models...');
      
      for (const modelName of modelNames) {
        try {
          const model = mongoose.model(modelName);
          
          // Create indexes if any are defined
          if (model.collection && model.schema.indexes().length > 0) {
            await model.createIndexes();
            console.log(`Created indexes for ${modelName}`);
          }
        } catch (error) {
          console.error(`Error creating indexes for ${modelName}:`, error.message);
        }
      }
      
      console.log('Finished creating indexes');
    } catch (error) {
      console.error('Error creating indexes:', error.message);
    }
  }
  
  /**
   * Check if MongoDB is connected
   * @returns {Boolean} True if connected
   */
  isConnectedToDatabase() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
  
  /**
   * Get the MongoDB connection
   * @returns {mongoose.Connection} MongoDB connection
   */
  getConnection() {
    return mongoose.connection;
  }
  
  /**
   * Get MongoDB connection status
   * @returns {Object} Connection status information
   */
  getStatus() {
    const readyState = mongoose.connection.readyState;
    
    const readyStateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
      99: 'uninitialized'
    };
    
    return {
      isConnected: this.isConnected,
      readyState: readyStateMap[readyState] || 'unknown',
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      port: mongoose.connection.port,
      models: mongoose.modelNames()
    };
  }
}

// Create singleton instance
const mongoDBConnector = new MongoDBConnector();

module.exports = mongoDBConnector;