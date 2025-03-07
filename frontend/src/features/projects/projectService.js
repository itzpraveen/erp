import api from '../../utils/api';

const API_URL = '/api/projects';

// Error handling helper function
const handleError = (error) => {
  console.error('Project service error:', error);
  
  // Handle detailed API error responses
  if (error.response && error.response.data) {
    const { message, error: errorMsg, details } = error.response.data;
    
    // Log detailed error information
    if (details) {
      console.error('Detailed error:', details);
    }
    
    // Return the most specific error message available
    return message || errorMsg || error.message || 'Unknown error';
  }
  
  return error.message || 'Network error: Could not connect to server';
};

// Fetch all projects
const getProjects = async (token, params = {}) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params,
      timeout: 10000, // 10 second timeout
    };

    const response = await api.get(API_URL, config);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Get project by ID
const getProjectById = async (id, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000, // 10 second timeout
    };

    const response = await api.get(`${API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

// Create a new project
const createProject = async (projectData, token) => {
  try {
    console.log('Creating project with data:', projectData);
    
    // Format the data properly for API compatibility
    const formattedData = formatProjectData(projectData);
    
    console.log('Formatted project data for API:', formattedData);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      timeout: 20000, // Increased timeout to 20 seconds
    };

    // Log the request details
    console.log('API Request:', {
      url: API_URL,
      method: 'POST',
      headers: config.headers,
      baseURL: api.defaults.baseURL
    });

    const response = await api.post(API_URL, formattedData, config);
    console.log('Project created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Project creation error:', error);
    
    // Enhanced error logging
    if (error.response) {
      console.error('Server response:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    
    throw handleError(error);
  }
};

// Helper function to format project data for the API
const formatProjectData = (projectData) => {
  // Check if this is a direct project creation (without a proposal)
  const isDirectCreation = !projectData.proposal;
  
  if (isDirectCreation) {
    console.log('Direct project creation detected');
    
    // Format the data for direct project creation
    // This will map UI form fields to the backend model
    return {
      name: projectData.name || 'New Project',
      customer: projectData.customer,
      contractNumber: projectData.contractNumber,
      location: projectData.location || '',
      type: projectData.type || 'on-grid',
      startDate: projectData.startDate || new Date().toISOString(),
      targetCompletionDate: projectData.targetCompletionDate || '',
      capacity: projectData.capacity || 0,
      notes: projectData.notes || '',
      budget: projectData.budget || 0,
      status: projectData.status || 'planning',
      paymentSchedule: projectData.paymentSchedule || [],
      progress: calculateProjectProgress(projectData.status) || 0
    };
  }
  
  // Format payment schedule data for both direct and proposal-based projects
  // Ensure payment schedule is included in the formatted data
  let formattedData = { ...projectData };
  
  // Make sure we have payment schedule array
  if (!formattedData.paymentSchedule) {
    formattedData.paymentSchedule = [];
  }
  
  // Ensure all payment amounts are numbers, not strings
  if (formattedData.paymentSchedule && formattedData.paymentSchedule.length > 0) {
    formattedData.paymentSchedule = formattedData.paymentSchedule.map(payment => ({
      ...payment,
      amount: typeof payment.amount === 'string' ? parseFloat(payment.amount) : payment.amount
    }));
  }
  
  return formattedData;
};

// Calculate project progress based on status
const calculateProjectProgress = (status) => {
  switch (status) {
    case 'planning': return 10;
    case 'permitting': return 25;
    case 'scheduled': return 40;
    case 'in_progress': return 60;
    case 'inspection': return 80;
    case 'completed': return 100;
    case 'cancelled': return 0;
    default: return 0;
  }
};

// Function declaration removed - duplicated below

// Get project statistics
const getProjectStats = async (token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000, // 10 second timeout
    };

    const response = await api.get(`${API_URL}/stats`, config);
    return response.data;
  } catch (error) {
    // Return default empty data on error instead of throwing
    console.error('Error fetching project stats:', error);
    return {
      statusCounts: [],
      avgTimelines: {},
      upcomingInstallations: [],
      projectsByMonth: []
    };
  }
};

// Update a project with proper formatting
const updateProject = async (id, projectData, token) => {
  try {
    console.log('Updating project with data:', projectData);
    
    // Format the data properly for API compatibility
    const formattedData = formatProjectData(projectData);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000, // 10 second timeout
    };

    const response = await api.put(`${API_URL}/${id}`, formattedData, config);
    console.log('Project updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('Project update error:', error);
    throw handleError(error);
  }
};

const projectService = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  getProjectStats,
  formatProjectData, // Export for testing
  calculateProjectProgress // Export for testing
};

export default projectService;