const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const http = require('http');
const WebSocket = require('ws');
const config = require('./config/config');
const connectDB = require('./config/db');
const logger = require('./utils/logger');
const httpLogger = require('./middleware/httpLoggerMiddleware');
const corsMiddleware = require('./middleware/corsMiddleware');
const dbStatusMiddleware = require('./middleware/dbStatusMiddleware');
const { ApiError, notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter, authLimiter, adminLimiter } = require('./middleware/rateLimitMiddleware');
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

// Connect to database
connectDB().then(() => {
  logger.info('Database connection established');
}).catch(err => {
  logger.error('Database connection failed', { error: err.message });
});

const app = express();

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
      connectSrc: ["'self'", 'wss://', 'ws://'],
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
app.use(httpLogger); // Log HTTP requests

// Apply rate limiting in production
if (config.nodeEnv === 'production') {
  app.use('/api/', apiLimiter);
  app.use('/api/users/login', authLimiter); // Strict limits on login
}

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    env: config.nodeEnv
  });
});

// Health routes first (avoid auth middleware)
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
  app.use(express.static(frontendBuildPath));

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
const wss = new WebSocket.Server({ server, path: '/ws' });
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
});

// Start server with proper error handling
const PORT = config.port;
server.listen(PORT, () => {
  logger.info(`Server running in ${config.nodeEnv} mode on port ${PORT}`, {
    port: PORT,
    mode: config.nodeEnv
  });
  logger.info(`WebSocket server available at ws://localhost:${PORT}/ws`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  logger.error('Unhandled Promise Rejection', { 
    error: err.message,
    stack: err.stack
  });
  
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception', { 
    error: err.message,
    stack: err.stack
  });
  
  // Close server & exit process
  server.close(() => process.exit(1));
});