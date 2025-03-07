/**
 * Enhanced security headers middleware for production environments
 * Implements best practices for web security
 */

const securityHeadersMiddleware = (req, res, next) => {
  // Set strict transport security header to force HTTPS
  // Note: Only enable this in production when you're ready for HTTPS-only
  if (process.env.NODE_ENV === 'production') {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }
  
  // Prevent browser MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Enable Cross-site scripting filter in browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Control browser features
  res.setHeader(
    'Permissions-Policy', 
    'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );
  
  // Set referrer policy (controls how much referrer information should be included)
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Add railway deployment ID to response headers if available
  if (process.env.RAILWAY_ENVIRONMENT_ID) {
    res.setHeader('X-Railway-Environment-ID', process.env.RAILWAY_ENVIRONMENT_ID);
  }
  
  // Remove headers that could expose server information
  res.removeHeader('X-Powered-By');
  res.removeHeader('Server');
  
  next();
};

module.exports = securityHeadersMiddleware;