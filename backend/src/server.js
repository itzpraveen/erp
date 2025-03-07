const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const http = require('http');
const WebSocket = require('ws');
const mongoose = require('mongoose');
const config = require('./config/config');
const connectDB = require('./config/db');
const seedDatabase = require('./seed');
const logger = require('./utils/logger');
const httpLogger = require('./middleware/httpLoggerMiddleware');
const corsMiddleware = require('./middleware/corsMiddleware');
const dbStatusMiddleware = require('./middleware/dbStatusMiddleware');
const requestTraceMiddleware = require('./middleware/requestTraceMiddleware');
const securityHeadersMiddleware = require('./middleware/securityHeadersMiddleware');
const { ApiError, notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter, authLimiter, adminLimiter, rateLimitMiddleware } = require('./middleware/rateLimitMiddleware');
const userRoutes = require('./routes/userRoutes');
const leadRoutes = require('./routes/leadRoutes');
const proposalRoutes = require('./routes/proposalRoutes');
const projectRoutes = require('./routes/projectRoutes');
const serviceRequestRoutes = require('./routes/serviceRequestRoutes');
const customerRoutes = require('./routes/customerRoutes');
const solarCalculatorRoutes = require('./routes/solarCalculatorRoutes');
const enhancedSolarCalculatorRoutes = require('./modules/solarCalculation/solarCalculationRoutes');
const testRoutes = require('./routes/testRoutes');
const healthRoutes = require('./routes/healthRoutes');

// Initialize application
logger.info(`Initializing server in ${config.nodeEnv} mode...`);

// Create Express application
const app = express();

// =====================================
// CRITICAL: HEALTH CHECK ENDPOINT
// Must be registered before any middleware
// This is used by Railway for deployment health checks
// =====================================
app.get('/health', (req, res) => {
  // Simple response with no dependencies
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Enhanced CORS configuration for different environments
const corsOptions = config.nodeEnv === 'production'
  ? {
      // In production, only allow specific domains
      origin: config.cors.allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      credentials: true, // Required for cookies to be sent
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Set-Cookie'], // Allow the Set-Cookie header to be exposed
      maxAge: 86400, // Cache preflight request for 24 hours
    }
  : {
      // In development, allow all local origins including from Docker containers
      origin: ['http://localhost:3002', 'http://localhost:3001', 'http://localhost:3000', 'http://erp-frontend:3001'],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      credentials: true, // Required for cookies to be sent
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      exposedHeaders: ['Set-Cookie'], // Allow the Set-Cookie header to be exposed
    };

app.use(cors(corsOptions));

// Use Helmet for security headers
app.use(helmet({
  contentSecurityPolicy: config.nodeEnv === 'production' ? undefined : false,
}));

// Configure Content Security Policy for WebSockets in production
if (config.nodeEnv === 'production') {
  app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", 'wss://*', 'ws://*', 'https://*'],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  }));
}

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser()); // Parse cookies for auth

// Add request tracing for production debugging (must be early in the middleware chain)
app.use(requestTraceMiddleware);

// Add security headers for production
app.use(securityHeadersMiddleware);

// Add HTTP logging middleware (with error handling)
try {
  app.use(httpLogger);
} catch (err) {
  logger.error('Failed to initialize HTTP logger middleware:', err);
}

// Add rate limit tracking middleware
app.use(rateLimitMiddleware);

// Apply rate limiting in production
if (config.nodeEnv === 'production') {
  app.use('/api/', apiLimiter);
  app.use('/api/users/login', authLimiter); // Strict limits on login
}

// Add database status route
app.get('/api/db-status', (req, res) => {
  const connection = mongoose.connection || {};
  res.json({
    status: connection.readyState === 1 ? 'connected' : 'disconnected',
    readyState: connection.readyState,
    name: connection.name || 'none',
    host: connection.host || 'none',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check API
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'API is running properly',
    time: new Date().toISOString(),
    env: config.nodeEnv,
    database: config.db.uri ? 'Configured' : 'Not Configured',
    version: '1.0.0'
  });
});

// Advanced health check endpoint with more details
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    env: config.nodeEnv,
    database: {
      connected: mongoose.connection?.readyState === 1,
      state: mongoose.connection?.readyState || 0
    }
  });
});

// Health routes
app.use('/api/health', healthRoutes);

// Test routes for debugging (no auth required)
if (config.nodeEnv !== 'production') {
  app.use('/api/test', testRoutes);
}

// Main API routes
app.use('/api/users', userRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/solar-calculator', solarCalculatorRoutes);
app.use('/api/enhanced-solar-calculator', enhancedSolarCalculatorRoutes);

// Serve static files from the React app in production
if (config.nodeEnv === 'production') {
  // Set static folder
  const frontendBuildPath = path.resolve(__dirname, '../../frontend/build');
  
  // Add cache control for static assets
  app.use(express.static(frontendBuildPath, {
    maxAge: '1d', // Cache for 1 day
    etag: true,    // Use ETags
    lastModified: true // Last-Modified header
  }));

  // Serve index.html for any routes not defined above (React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendBuildPath, 'index.html'));
  });
} else {
  // Base route for development
  app.get('/', (req, res) => {
    res.send('API is running...');
  });
}

// Error middleware
app.use(notFound);
app.use(errorHandler);

// Create HTTP server
const server = http.createServer(app);

// Setup WebSocket server
const wss = new WebSocket.Server({ 
  server, 
  path: '/ws',
  // Add these settings for more reliable connections
  clientTracking: true,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    concurrencyLimit: 10,
    threshold: 1024 // Size below which messages should not be compressed
  }
});

logger.info('WebSocket server initialized');

// WebSocket handling
wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  logger.info('WebSocket client connected', { 
    ip: clientIp,
    userAgent: req.headers['user-agent'] || 'Unknown'
  });
  
  // Send welcome message
  ws.send(JSON.stringify({ type: 'connection', message: 'Connected to ERP WebSocket Server' }));
  
  // Handle incoming messages
  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      logger.debug('Received websocket message', { messageType: data.type });
      
      // Process message types
      switch (data.type) {
        case 'ping':
          ws.send(JSON.stringify({ type: 'pong', time: new Date().toISOString() }));
          break;
        default:
          logger.warn('Unhandled websocket message type', { type: data.type });
      }
    } catch (error) {
      logger.error('Error processing WebSocket message', { 
        error: error.message,
        message: typeof message === 'string' ? message : 'Non-string message'
      });
    }
  });
  
  // Handle disconnection
  ws.on('close', () => {
    logger.info('WebSocket client disconnected', { ip: clientIp });
  });
  
  // Send ping to keep connection alive
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.ping();
    } else {
      clearInterval(pingInterval);
    }
  }, 30000); // 30 seconds
  
  // Clean up on close
  ws.on('close', () => {
    clearInterval(pingInterval);
  });
});

// Flag to track if server is ready
let serverReady = false;

// Connect to database, seed initial data if needed, and start server
(async () => {
  let dbConnected = false;
  
  try {
    // Try to connect to the database but don't wait forever
    // Use a timeout to ensure server starts even if DB connection hangs
    const dbConnectPromise = connectDB();
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 20000)
    );
    
    await Promise.race([dbConnectPromise, timeout])
      .then(async () => {
        dbConnected = true;
        logger.info('Database connected successfully');
        
        // Seed the database with initial admin user if needed
        try {
          await seedDatabase();
        } catch (seedError) {
          logger.error('Error seeding database:', seedError);
        }
      })
      .catch(err => {
        logger.error('Database connection failed or timed out', err);
      });
  } catch (err) {
    logger.error('Failed to connect to database during startup', err);
  }
  
  // Start server regardless of DB connection in production
  if (dbConnected || config.nodeEnv === 'production') {
    startServer();
  } else {
    logger.error('Exiting due to database connection failure in development mode');
    process.exit(1);
  }
})();

// Function to start the server
function startServer() {
  const PORT = config.port;
  server.listen(PORT, () => {
    serverReady = true;
    logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`, {
      port: PORT,
      mode: config.nodeEnv
    });
    logger.info(`WebSocket server available at ws://localhost:${PORT}/ws`);
    
    // If db is not connected, try to reconnect in the background
    if (mongoose.connection.readyState !== 1) {
      logger.warn('Server started without database connection. Will retry in background.');
      
      // Try to reconnect to database in background
      setTimeout(() => {
        connectDB()
          .then(() => logger.info('Background database connection successful'))
          .catch(err => logger.error('Background database connection failed', err));
      }, 10000); // Wait 10 seconds before trying again
    }
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection', { 
    error: err.message,
    stack: err.stack
  });
  
  // Don't crash the server in production, but log the error
  if (config.nodeEnv !== 'production') {
    // Close server & exit process in development
    server.close(() => process.exit(1));
  }
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { 
    error: err.message,
    stack: err.stack
  });
  
  // Don't crash the server in production for all errors, but log them
  if (config.nodeEnv !== 'production' || err.message.includes('FATAL')) {
    // Close server & exit process
    server.close(() => process.exit(1));
  }
});