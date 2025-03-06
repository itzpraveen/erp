/**
 * Currency formatting utility for the entire application
 * Using Indian Rupee (₹) with Indian number formatting (lakhs, crores)
 */

/**
 * Format a number as Indian currency (₹)
 * 
 * @param {number} amount - The amount to format
 * @param {object} options - Formatting options
 * @param {boolean} options.compact - Whether to use compact format for large numbers
 * @param {number} options.decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, options = {}) => {
  const decimals = options.decimals !== undefined ? options.decimals : 0;
  
  if (amount === null || amount === undefined) {
    return '₹0';
  }

  // For large numbers, use Indian format with lakh/crore terminology if compact option is true
  if (options.compact && amount >= 100000) {
    if (amount >= 10000000) {
      // Convert to crores (1 crore = 10,000,000)
      return `₹${(amount / 10000000).toFixed(2)} Cr`;
    } else {
      // Convert to lakhs (1 lakh = 100,000)
      return `₹${(amount / 100000).toFixed(2)} L`;
    }
  }

  // Use Indian locale with INR currency
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(amount);
};

/**
 * Format a number with Indian number formatting (thousands, lakhs, crores)
 * 
 * @param {number} number - The number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number string
 */
export const formatNumber = (number, decimals = 0) => {
  if (number === null || number === undefined) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(number);
};

export default formatCurrency;
