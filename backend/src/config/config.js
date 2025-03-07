const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env file
dotenv.config({
  path: process.env.NODE_ENV === 'production' 
    ? path.resolve(process.cwd(), '.env.production')
    : path.resolve(process.cwd(), '.env')
});

// Configuration object with all environment variables
const config = {
  // Node environment
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Server configuration
  port: process.env.PORT || 5001,
  
  // MongoDB configuration
  db: {
    uri: process.env.MONGO_URI,
    options: {
      // Note: These options are now handled automatically by Mongoose 8.x
      // Explicitly set for clarity and backward compatibility
      useNewUrlParser: true,
      useUnifiedTopology: true,
      retryWrites: true,
      w: 'majority',
      maxPoolSize: 10, // Connection pool size
      serverSelectionTimeoutMS: 30000, // Server selection timeout in milliseconds
      socketTimeoutMS: 45000, // Socket timeout in milliseconds
    }
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'dev-secret-do-not-use-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // CORS configuration
  cors: {
    allowedOrigins: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',') 
      : ['*']
  },
  
  // Redis configuration (if used)
  redis: {
    uri: process.env.REDIS_URI || null,
    password: process.env.REDIS_PASSWORD || null
  }
};

// Validate required configuration values
const requiredConfigs = ['db.uri', 'jwt.secret'];
const missingConfigs = [];

requiredConfigs.forEach(configPath => {
  const pathParts = configPath.split('.');
  let currentConfig = config;
  
  // Navigate through the config object
  for (const part of pathParts) {
    currentConfig = currentConfig[part];
    if (currentConfig === undefined || currentConfig === null || currentConfig === '') {
      missingConfigs.push(configPath);
      break;
    }
  }
});

// In production, throw an error if required configs are missing
if (config.nodeEnv === 'production' && missingConfigs.length > 0) {
  throw new Error(`Missing required configuration: ${missingConfigs.join(', ')}`);
}

module.exports = config;
