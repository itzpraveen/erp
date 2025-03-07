/**
 * Simple logger utility for consistent logging
 */

const getTimestamp = () => {
  return new Date().toISOString();
};

// Safely stringify objects for logging
const safeStringify = (obj) => {
  if (typeof obj === 'string') return obj;
  
  try {
    const seen = new WeakSet(); // Move weakset inside to avoid persistence between calls
    return JSON.stringify(obj, (key, value) => {
      // Handle circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }
      return value;
    }, 2);
  } catch (error) {
    return `[Unstringifiable Object: ${error.message}]`;
  }
};

// Color codes for console output (only in development)
const colors = process.env.NODE_ENV !== 'production' ? {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
} : {
  reset: '',
  red: '',
  green: '',
  yellow: '',
  blue: '',
  magenta: '',
  cyan: ''
};

const logger = {
  /**
   * Log info message
   * @param {string} message - Log message
   * @param {Object} [meta] - Optional metadata
   */
  info: (message, meta = {}) => {
    const timestamp = getTimestamp();
    const metaString = Object.keys(meta).length > 0 ? ` ${safeStringify(meta)}` : '';
    
    console.log(`${colors.green}[INFO]${colors.reset} ${timestamp} - ${message}${metaString}`);
  },
  
  /**
   * Log debug message (only in development)
   * @param {string} message - Log message
   * @param {Object} [meta] - Optional metadata
   */
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV === 'production' && process.env.LOG_LEVEL !== 'debug') return;
    
    const timestamp = getTimestamp();
    const metaString = Object.keys(meta).length > 0 ? ` ${safeStringify(meta)}` : '';
    
    console.log(`${colors.blue}[DEBUG]${colors.reset} ${timestamp} - ${message}${metaString}`);
  },
  
  /**
   * Log warning message
   * @param {string} message - Log message
   * @param {Object} [meta] - Optional metadata
   */
  warn: (message, meta = {}) => {
    const timestamp = getTimestamp();
    const metaString = Object.keys(meta).length > 0 ? ` ${safeStringify(meta)}` : '';
    
    console.warn(`${colors.yellow}[WARN]${colors.reset} ${timestamp} - ${message}${metaString}`);
  },
  
  /**
   * Log error message
   * @param {string} message - Log message
   * @param {Object} [meta] - Optional metadata
   */
  error: (message, meta = {}) => {
    const timestamp = getTimestamp();
    let metaString = '';
    
    // Special handling for Error objects
    if (meta instanceof Error) {
      metaString = ` ${meta.stack || meta.message}`;
    } else if (Object.keys(meta).length > 0) {
      metaString = ` ${safeStringify(meta)}`;
    }
    
    console.error(`${colors.red}[ERROR]${colors.reset} ${timestamp} - ${message}${metaString}`);
  },
  
  /**
   * Log HTTP request/response
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} responseTime - Response time in milliseconds
   */
  http: (req, res, responseTime) => {
    const timestamp = getTimestamp();
    const statusCode = res.statusCode;
    
    // Color based on status code
    let statusColor = colors.green; // 2xx
    if (statusCode >= 400) {
      statusColor = colors.red; // 4xx, 5xx
    } else if (statusCode >= 300) {
      statusColor = colors.yellow; // 3xx
    }
    
    const logMessage = `${colors.cyan}[HTTP]${colors.reset} ${timestamp} - ${req.method} ${req.originalUrl} ${statusColor}${statusCode}${colors.reset} ${responseTime.toFixed(2)}ms`;
    
    if (statusCode >= 400) {
      console.error(logMessage);
    } else {
      console.log(logMessage);
    }
  }
};

module.exports = logger;