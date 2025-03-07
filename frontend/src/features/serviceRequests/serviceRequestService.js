import api from '../../utils/api';

const API_URL = '/service-requests';

// Error handling helper function
const handleServiceError = (error) => {
  const errorMessage = 
    (error.response && 
      error.response.data && 
      error.response.data.message) ||
    error.message ||
    error.toString();
  
  console.error('Service Request API Error:', {
    status: error.response?.status,
    message: errorMessage,
    endpoint: error.config?.url,
    method: error.config?.method,
  });
  
  return errorMessage;
};

// Get all service requests
const getServiceRequests = async (token, params = {}) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
    };

    const response = await api.get(API_URL, config);
    return response.data;
  } catch (error) {
    throw handleServiceError(error);
  }
};

// Get service request by ID
const getServiceRequestById = async (id, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await api.get(`${API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    throw handleServiceError(error);
  }
};

// Create new service request
const createServiceRequest = async (requestData, token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await api.post(API_URL, requestData, config);
    return response.data;
  } catch (error) {
    throw handleServiceError(error);
  }
};

// Update service request
const updateServiceRequest = async (id, requestData, token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await api.put(`${API_URL}/${id}`, requestData, config);
    return response.data;
  } catch (error) {
    throw handleServiceError(error);
  }
};

// Update service request status
const updateServiceRequestStatus = async (id, statusData, token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await api.patch(`${API_URL}/${id}/status`, statusData, config);
    return response.data;
  } catch (error) {
    throw handleServiceError(error);
  }
};

// Add parts to service request
const addServiceRequestParts = async (id, partsData, token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await api.post(`${API_URL}/${id}/parts`, partsData, config);
    return response.data;
  } catch (error) {
    throw handleServiceError(error);
  }
};

// Add customer feedback to service request
const addCustomerFeedback = async (id, feedbackData, token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await api.post(`${API_URL}/${id}/feedback`, feedbackData, config);
    return response.data;
  } catch (error) {
    throw handleServiceError(error);
  }
};

// Get service request statistics
const getServiceStats = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await api.get(`${API_URL}/stats`, config);
    return response.data;
  } catch (error) {
    throw handleServiceError(error);
  }
};

const serviceRequestService = {
  getServiceRequests,
  getServiceRequestById,
  createServiceRequest,
  updateServiceRequest,
  updateServiceRequestStatus,
  addServiceRequestParts,
  addCustomerFeedback,
  getServiceStats,
};

export default serviceRequestService;