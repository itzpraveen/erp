/**
 * Custom error class for API errors
 */
class ApiError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message, errors = []) {
    return new ApiError(message, 400, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(message, 401);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(message, 403);
  }

  static notFound(message = 'Resource not found') {
    return new ApiError(message, 404);
  }

  static internalServer(message = 'Internal server error') {
    return new ApiError(message, 500);
  }
}

/**
 * Middleware for handling 404 Not Found
 */
const notFound = (req, res, next) => {
  const error = ApiError.notFound(`Not Found - ${req.originalUrl}`);
  next(error);
};

/**
 * Centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  // Generate a unique request ID for tracking
  const requestId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  // Handle specific error types
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    err = ApiError.badRequest('Invalid ID format');
  }
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(error => ({
      field: error.path,
      message: error.message
    }));
    err = ApiError.badRequest('Validation Error', errors);
  }
  
  if (err.name === 'JsonWebTokenError') {
    err = ApiError.unauthorized('Invalid token');
  }
  
  if (err.name === 'TokenExpiredError') {
    err = ApiError.unauthorized('Token expired');
  }
  
  // Default status code handling
  const statusCode = err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  
  // Enhanced logging for server errors
  const logLevel = statusCode >= 500 ? 'error' : 'warn';
  if (logLevel === 'error') {
    console.error(`[ERROR] [${requestId}]`, {
      method: req.method,
      url: req.originalUrl,
      body: process.env.NODE_ENV === 'production' ? '[REDACTED]' : req.body,
      params: req.params,
      query: req.query,
      error: err.message,
      stack: err.stack
    });
  } else {
    console.warn(`[WARN] [${requestId}]`, {
      method: req.method,
      url: req.originalUrl,
      statusCode,
      error: err.message
    });
  }
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    message: err.message || 'An unexpected error occurred',
    errors: err.errors || null,
    requestId,
    // Include stack trace in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = { 
  ApiError,
  notFound, 
  errorHandler 
};