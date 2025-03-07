import api from '../../utils/api';

// Error handling helper
const handleError = (error) => {
  const message =
    error.response && error.response.data.message
      ? error.response.data.message
      : error.message;
  return message;
};

// Get all customers (from leads API)
const getCustomers = async (token, params = {}) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    };

    // Use the leads/customers endpoint instead
    const response = await api.get('/leads/customers', config);
    return { customers: response.data };  // Format response to match expected structure
  } catch (error) {
    throw handleError(error);
  }
};

// Get customer by ID (from leads API)
const getCustomerById = async (id, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await api.get(`/leads/${id}`, config);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Create customer (using leads API)
const createCustomer = async (customerData, token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await api.post('/leads', customerData, config);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Update customer (using leads API)
const updateCustomer = async (id, customerData, token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await api.put(`/leads/${id}`, customerData, config);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get customer history - fall back to basic customer data if API doesn't exist
const getCustomerHistory = async (id, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await api.get(`/customers/${id}/history`, config);
      return response.data;
    } catch (historyError) {
      // If the history endpoint doesn't exist, just return the customer
      const customer = await getCustomerById(id, token);
      return { customer };
    }
  } catch (error) {
    throw handleError(error);
  }
};

// Get customer stats - fall back to empty data if API doesn't exist
const getCustomerStats = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await api.get(`/customers/stats`, config);
      return response.data;
    } catch (statsError) {
      // Return empty stats if endpoint doesn't exist
      return {
        typeCounts: [],
        statusCounts: [],
        totalValue: 0,
        customersByMonth: [],
        topCustomers: []
      };
    }
  } catch (error) {
    throw handleError(error);
  }
};

const customerService = {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  getCustomerHistory,
  getCustomerStats,
};

export default customerService;