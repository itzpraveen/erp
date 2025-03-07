/**
 * Centralized API service
 * 
 * This service provides a clean interface for making API calls,
 * abstracting the implementation details from the components and
 * providing consistent error handling.
 */
import api from '../utils/api';

/**
 * Generic response handler
 * @param {Promise} promise - API call promise
 * @returns {Promise} - Processed response or error
 */
const handleResponse = async (promise) => {
  try {
    const response = await promise;
    return { data: response.data, error: null };
  } catch (error) {
    const errorMessage = 
      error.response?.data?.message || 
      error.message || 
      'An unexpected error occurred';
    
    const errorDetails = error.response?.data?.errors || null;
    const statusCode = error.response?.status || 500;
    
    // Log the error
    console.error('API Error:', {
      message: errorMessage,
      statusCode,
      details: errorDetails,
      url: error.config?.url
    });
    
    return { 
      data: null, 
      error: {
        message: errorMessage,
        statusCode,
        details: errorDetails
      }
    };
  }
};

/**
 * API service for authentication
 */
export const authService = {
  login: async (credentials) => {
    return handleResponse(api.post('/api/users/login', credentials, { withCredentials: true }));
  },
  
  logout: async () => {
    return handleResponse(api.post('/api/users/logout', {}, { withCredentials: true }));
  },
  
  checkAuthStatus: async () => {
    return handleResponse(api.get('/api/users/profile', { withCredentials: true }));
  },
  
  updateProfile: async (userData) => {
    return handleResponse(api.put('/api/users/profile', userData, { withCredentials: true }));
  },
};

/**
 * API service for leads
 */
export const leadService = {
  getLeads: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filters
    if (params.status) queryParams.append('status', params.status);
    if (params.source) queryParams.append('source', params.source);
    if (params.assignedTo) queryParams.append('assignedTo', params.assignedTo);
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = `/api/leads${queryString ? `?${queryString}` : ''}`;
    
    return handleResponse(api.get(url));
  },
  
  getLeadById: async (id) => {
    return handleResponse(api.get(`/api/leads/${id}`));
  },
  
  createLead: async (leadData) => {
    return handleResponse(api.post('/api/leads', leadData));
  },
  
  updateLead: async (id, leadData) => {
    return handleResponse(api.put(`/api/leads/${id}`, leadData));
  },
  
  deleteLead: async (id) => {
    return handleResponse(api.delete(`/api/leads/${id}`));
  },
  
  getLeadStats: async () => {
    return handleResponse(api.get('/api/leads/stats'));
  }
};

/**
 * API service for customers
 */
export const customerService = {
  getCustomers: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filters
    if (params.status) queryParams.append('status', params.status);
    if (params.type) queryParams.append('type', params.type);
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = `/api/customers${queryString ? `?${queryString}` : ''}`;
    
    return handleResponse(api.get(url));
  },
  
  getCustomerById: async (id) => {
    return handleResponse(api.get(`/api/customers/${id}`));
  },
  
  createCustomer: async (customerData) => {
    return handleResponse(api.post('/api/customers', customerData));
  },
  
  updateCustomer: async (id, customerData) => {
    return handleResponse(api.put(`/api/customers/${id}`, customerData));
  },
  
  deleteCustomer: async (id) => {
    return handleResponse(api.delete(`/api/customers/${id}`));
  }
};

/**
 * API service for projects
 */
export const projectService = {
  getProjects: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filters
    if (params.status) queryParams.append('status', params.status);
    if (params.customer) queryParams.append('customer', params.customer);
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = `/api/projects${queryString ? `?${queryString}` : ''}`;
    
    return handleResponse(api.get(url));
  },
  
  getProjectById: async (id) => {
    return handleResponse(api.get(`/api/projects/${id}`));
  },
  
  createProject: async (projectData) => {
    return handleResponse(api.post('/api/projects', projectData));
  },
  
  updateProject: async (id, projectData) => {
    return handleResponse(api.put(`/api/projects/${id}`, projectData));
  },
  
  updateProjectStatus: async (id, status) => {
    return handleResponse(api.put(`/api/projects/${id}/status`, { status }));
  },
  
  assignTeam: async (id, team) => {
    return handleResponse(api.put(`/api/projects/${id}/assign-team`, { team }));
  },
  
  getProjectStats: async () => {
    return handleResponse(api.get('/api/projects/stats'));
  }
};

/**
 * API service for proposals
 */
export const proposalService = {
  getProposals: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filters
    if (params.status) queryParams.append('status', params.status);
    if (params.lead) queryParams.append('lead', params.lead);
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = `/api/proposals${queryString ? `?${queryString}` : ''}`;
    
    return handleResponse(api.get(url));
  },
  
  getProposalById: async (id) => {
    return handleResponse(api.get(`/api/proposals/${id}`));
  },
  
  createProposal: async (proposalData) => {
    return handleResponse(api.post('/api/proposals', proposalData));
  },
  
  updateProposal: async (id, proposalData) => {
    return handleResponse(api.put(`/api/proposals/${id}`, proposalData));
  },
  
  deleteProposal: async (id) => {
    return handleResponse(api.delete(`/api/proposals/${id}`));
  },
  
  submitProposal: async (id) => {
    return handleResponse(api.post(`/api/proposals/${id}/submit`));
  },
  
  approveProposal: async (id, level, comments = '') => {
    const endpoint = level === 'manager' ? 'manager-approve' : 'admin-approve';
    return handleResponse(api.post(`/api/proposals/${id}/${endpoint}`, { comments }));
  },
  
  requestAdjustments: async (id, adjustmentData) => {
    return handleResponse(api.post(`/api/proposals/${id}/request-adjustments`, adjustmentData));
  }
};

/**
 * API service for service requests
 */
export const serviceRequestService = {
  getServiceRequests: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    // Add filters
    if (params.status) queryParams.append('status', params.status);
    if (params.priority) queryParams.append('priority', params.priority);
    if (params.type) queryParams.append('type', params.type);
    if (params.customer) queryParams.append('customer', params.customer);
    if (params.project) queryParams.append('project', params.project);
    if (params.search) queryParams.append('search', params.search);
    
    const queryString = queryParams.toString();
    const url = `/api/service-requests${queryString ? `?${queryString}` : ''}`;
    
    return handleResponse(api.get(url));
  },
  
  getServiceRequestById: async (id) => {
    return handleResponse(api.get(`/api/service-requests/${id}`));
  },
  
  createServiceRequest: async (serviceRequestData) => {
    return handleResponse(api.post('/api/service-requests', serviceRequestData));
  },
  
  updateServiceRequest: async (id, serviceRequestData) => {
    return handleResponse(api.put(`/api/service-requests/${id}`, serviceRequestData));
  },
  
  updateStatus: async (id, status) => {
    return handleResponse(api.put(`/api/service-requests/${id}/status`, { status }));
  },
  
  assignTechnician: async (id, technicianId) => {
    return handleResponse(api.put(`/api/service-requests/${id}/assign`, { technicianId }));
  },
  
  addServiceParts: async (id, parts) => {
    return handleResponse(api.post(`/api/service-requests/${id}/parts`, { parts }));
  },
  
  addFeedback: async (id, feedback) => {
    return handleResponse(api.post(`/api/service-requests/${id}/feedback`, feedback));
  }
};

/**
 * API service for solar calculation and design
 */
export const solarDesignService = {
  calculateSystemSize: async (data) => {
    return handleResponse(api.post('/api/solar-calculator/system-size', data));
  },
  
  estimateProduction: async (data) => {
    return handleResponse(api.post('/api/solar-calculator/production', data));
  },
  
  calculateROI: async (data) => {
    return handleResponse(api.post('/api/solar-calculator/roi', data));
  },
  
  getAvailableEquipment: async (type) => {
    return handleResponse(api.get(`/api/equipment/${type}`));
  }
};

// Export all services as default
export default {
  auth: authService,
  leads: leadService,
  customers: customerService,
  projects: projectService,
  proposals: proposalService,
  serviceRequests: serviceRequestService,
  solarDesign: solarDesignService
};