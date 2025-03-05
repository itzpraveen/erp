import axios from 'axios';

const API_URL = '/api/service-requests';

// Get all service requests
const getServiceRequests = async (token, params = {}) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  };

  const response = await axios.get(API_URL, config);
  return response.data;
};

// Get service request by ID
const getServiceRequestById = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`${API_URL}/${id}`, config);
  return response.data;
};

// Create new service request
const createServiceRequest = async (requestData, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(API_URL, requestData, config);
  return response.data;
};

// Update service request
const updateServiceRequest = async (id, requestData, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.put(`${API_URL}/${id}`, requestData, config);
  return response.data;
};

// Update service request status
const updateServiceRequestStatus = async (id, statusData, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.patch(`${API_URL}/${id}/status`, statusData, config);
  return response.data;
};

// Add parts to service request
const addServiceRequestParts = async (id, partsData, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(`${API_URL}/${id}/parts`, partsData, config);
  return response.data;
};

// Add customer feedback to service request
const addCustomerFeedback = async (id, feedbackData, token) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.post(`${API_URL}/${id}/feedback`, feedbackData, config);
  return response.data;
};

// Get service request statistics
const getServiceStats = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`${API_URL}/stats`, config);
  return response.data;
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