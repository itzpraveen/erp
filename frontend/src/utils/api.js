import axios from 'axios';

// Create axios instance
const api = axios.create();

// Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;

    // If token exists, add to headers
    if (userInfo && userInfo.token) {
      config.headers['Authorization'] = `Bearer ${userInfo.token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const userInfo = localStorage.getItem('userInfo')
      ? JSON.parse(localStorage.getItem('userInfo'))
      : null;

    // If token exists, add to headers
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    
    // Debug logging only in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', config.method.toUpperCase(), config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    if (error.response) {
      const { status, data, config } = error.response;
      // Enhanced error logging especially for 500 errors
      if (status === 500) {
        console.error(
          `SERVER ERROR (500): ${config.url}\n` +
          `Method: ${config.method.toUpperCase()}\n` +
          `Data: ${JSON.stringify(data)}\n` +
          `Request Payload: ${config.data ? JSON.stringify(JSON.parse(config.data)) : 'None'}`
        );
      } else {
        console.error(
          'API Error:',
          status,
          config.url,
          data
        );
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('API Error: No response received', error.request);
    } else {
      // Something happened in setting up the request
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
