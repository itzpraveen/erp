const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Enhanced logging for server errors
  if (statusCode === 500) {
    console.error('SERVER ERROR:', {
      method: req.method,
      path: req.path,
      body: req.body,
      params: req.params,
      query: req.query,
      error: err.message,
      stack: err.stack
    });
  }
  
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    requestId: Date.now().toString(36) + Math.random().toString(36).substr(2) // Adds a request ID for tracking
  });
};

module.exports = { notFound, errorHandler };