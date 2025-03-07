import axios from 'axios';
import { normalizePath } from './apiUtils';

// Figure out base URL based on environment
const getBaseUrl = () => {
  // When deployed to Railway, we serve frontend from the same domain as backend
  // So we can use relative URLs
  return '/api';
};

// Create axios instance with defaults
const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
  withCredentials: true, // Include cookies in requests
});

// Request interceptor for API calls
api.interceptors.request.use(
  (config) => {
    // Normalize URL to prevent duplicate /api/ prefixes
    if (config.url) {
      const originalUrl = config.url;
      // Detect if the URL starts with /api/ but we already have /api as baseURL
      if (originalUrl.startsWith('/api/')) {
        // Remove duplicate api prefix
        config.url = originalUrl.replace('/api/', '/');
      } else if (originalUrl.startsWith('api/')) {
        // Handle case without leading slash
        config.url = '/' + originalUrl.substring(4);
      }
    }
    
    // For backwards compatibility with existing code, check for token in userInfo
    // This can be removed once cookie auth is fully implemented
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;

    // If token exists in localStorage, add to headers (for backwards compatibility)
    if (userInfo && userInfo.token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${userInfo.token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Only log in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', response.status, response.config.url);
    }
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response;
      
      // Handle authentication errors
      if (status === 401) {
        // Clear any existing user data on auth errors
        localStorage.removeItem('userInfo');
        
        // Redirect to login if not already there
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
      
      // Only log errors in development
      if (process.env.NODE_ENV === 'development') {
        if (status === 500) {
          console.error(
            `SERVER ERROR (500): ${config.url}\n` +
            `Method: ${config.method.toUpperCase()}\n` +
            `Data: ${JSON.stringify(data)}`
          );
        } else {
          console.error('API Error:', status, config.url, data);
        }
      }
    } else if (error.request && process.env.NODE_ENV === 'development') {
      // The request was made but no response was received
      console.error('API Error: No response received', error.request);
    } else if (process.env.NODE_ENV === 'development') {
      // Something happened in setting up the request
      console.error('API Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;