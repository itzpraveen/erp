/**
 * API Utilities for normalizing endpoint paths and preventing duplicate prefixes
 */

/**
 * Normalizes an API path to prevent duplicate prefixes
 * This ensures that no matter how the path is provided, it won't have duplicate /api/ prefixes
 * 
 * @param {string} path - The API endpoint path
 * @returns {string} Normalized path without duplicate prefixes
 */
export const normalizePath = (path) => {
  // Remove leading slash if present for consistency
  const trimmedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // Check if path already starts with 'api/'
  if (trimmedPath.startsWith('api/')) {
    // Return without the api/ prefix since our axios instance already has baseURL: '/api'
    return '/' + trimmedPath.substring(4);
  }
  
  // Return with leading slash
  return '/' + trimmedPath;
};

/**
 * Creates a complete API path with parameters
 * 
 * @param {string} basePath - The base endpoint path
 * @param {string} id - Optional ID parameter
 * @param {string} action - Optional action (e.g., 'submit', 'approve')
 * @returns {string} Properly formatted API path
 */
export const createApiPath = (basePath, id = null, action = null) => {
  let path = normalizePath(basePath);
  
  if (id) {
    path += `/${id}`;
  }
  
  if (action) {
    path += `/${action}`;
  }
  
  return path;
};

/**
 * Creates a consistent service API base URL
 * 
 * @param {string} entityName - The entity name (e.g., 'users', 'projects')
 * @returns {string} Normalized base URL for the entity API
 */
export const createServiceBaseUrl = (entityName) => {
  return normalizePath(entityName);
};
