/**
 * Formats an address object into a human-readable string
 * Handles both address objects and string addresses
 * 
 * @param {Object|String} address - Address object or string
 * @param {String} separator - Character to use as separator (default: ', ')
 * @returns {String} Formatted address string
 */
export const formatAddress = (address, separator = ', ') => {
  // If address is null or undefined, return empty string
  if (!address) return '';
  
  // If address is already a string, return it directly
  if (typeof address === 'string') return address;
  
  // If address is an object, format it properly
  if (typeof address === 'object') {
    const { street, city, state, zipCode, country } = address;
    
    // Filter out empty values and join with the separator
    return [street, city, state, zipCode, country]
      .filter(Boolean) // Remove empty, null or undefined values
      .join(separator);
  }
  
  // If we get here, the address is in an unexpected format
  console.warn('Address in unexpected format:', address);
  return String(address);
};

/**
 * Validates an address object to make sure it has the expected structure
 * 
 * @param {Object} address - Address object to validate 
 * @returns {Boolean} True if valid, false otherwise
 */
export const isValidAddressObject = (address) => {
  if (!address || typeof address !== 'object') return false;
  
  // Check if at least one of the key address properties exists
  return ['street', 'city', 'state', 'zipCode', 'country']
    .some(key => address.hasOwnProperty(key));
};
