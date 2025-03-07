// Export all formatters from this file for easy importing
export * from './currencyFormatter';
export * from './addressFormatter';

/**
 * Common formatting functions for dates and other data
 */

/**
 * Formats a date string into a localized format
 * 
 * @param {String|Date} dateString - Date to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {String} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Use sensible defaults if not specified
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options
    };
    
    return new Date(date).toLocaleDateString(undefined, defaultOptions);
  } catch (error) {
    console.warn('Error formatting date:', error);
    return dateString;
  }
};

/**
 * Formats a time string into a localized format
 * 
 * @param {String|Date} dateString - Date/time to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {String} Formatted time string
 */
export const formatTime = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Use sensible defaults if not specified
    const defaultOptions = {
      hour: 'numeric',
      minute: 'numeric',
      ...options
    };
    
    return new Date(date).toLocaleTimeString(undefined, defaultOptions);
  } catch (error) {
    console.warn('Error formatting time:', error);
    return dateString;
  }
};

/**
 * Formats a datetime string into a localized format
 * 
 * @param {String|Date} dateString - Date/time to format
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {String} Formatted datetime string
 */
export const formatDateTime = (dateString, options = {}) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    
    // Use sensible defaults if not specified
    const defaultOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      ...options
    };
    
    return new Date(date).toLocaleString(undefined, defaultOptions);
  } catch (error) {
    console.warn('Error formatting datetime:', error);
    return dateString;
  }
};

/**
 * Formats status strings by replacing underscores with spaces and capitalizing
 * 
 * @param {String} status - Status string to format (e.g. "in_progress")
 * @returns {String} Formatted status (e.g. "In Progress")
 */
export const formatStatus = (status) => {
  if (!status) return '';
  
  return status
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
