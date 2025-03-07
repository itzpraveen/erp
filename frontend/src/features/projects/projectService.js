import api from '../../utils/api';

const API_URL = '/projects';

// Error handling helper function
const handleError = (error) => {
  console.error('Project service error:', error);
  const message =
    error.response && error.response.data.message
      ? error.response.data.message
      : error.message || 'Unknown error';
  return message;
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
    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      timeout: 10000, // 10 second timeout
    };

    const response = await api.post(API_URL, projectData, config);
    return response.data;
  } catch (error) {
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