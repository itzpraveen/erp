/**
 * Enhanced CORS middleware for handling cross-origin requests
 * This ensures proper CORS settings for both regular HTTP and WebSocket connections
 */
const corsMiddleware = (req, res, next) => {
  // Get the origin from the request
  const origin = req.headers.origin;
  
  // List of allowed origins
  let allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://erp-frontend:3001'
  ];
  
  // If there are environment-defined origins, add them
  if (process.env.ALLOWED_ORIGINS) {
    allowedOrigins = allowedOrigins.concat(process.env.ALLOWED_ORIGINS.split(','));
  }
  
  // In production, client URL takes precedence if defined
  if (process.env.NODE_ENV === 'production' && process.env.CLIENT_URL) {
    allowedOrigins.push(process.env.CLIENT_URL);
  }
  
  // Check if the request origin is in our allowed list
  if (origin && allowedOrigins.includes(origin)) {
    // Set CORS headers for this specific origin (more secure than wildcard)
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (process.env.NODE_ENV !== 'production') {
    // In development, allow any origin as a fallback
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  // Set additional CORS headers
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }
  
  next();
};

module.exports = corsMiddleware;
