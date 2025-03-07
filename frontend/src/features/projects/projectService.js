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

    const response = await api.post(API_URL, projectData, config);
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

// Update a project
const updateProject = async (id, projectData, token) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000, // 10 second timeout
    };

    const response = await api.put(`${API_URL}/${id}`, projectData, config);
    return response.data;
  } catch (error) {
    throw handleError(error);
  }
};

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

const projectService = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  getProjectStats
};

export default projectService;