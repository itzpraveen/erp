import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectService from './projectService';
import { updateProposal } from '../proposals/proposalSlice';

// Initial state
const initialState = {
  projects: [],
  project: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  page: 1,
  pages: 1,
  projectStats: {
    statusCounts: [],
    avgTimelines: {},
    upcomingInstallations: [],
    projectsByMonth: []
  }
};

// Get all projects
export const getProjects = createAsyncThunk(
  'projects/getAll',
  async (params, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await projectService.getProjects(userInfo.token, params);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Get project by ID
export const getProjectById = createAsyncThunk(
  'projects/getById',
  async (id, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await projectService.getProjectById(id, userInfo.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Get project statistics
export const getProjectStats = createAsyncThunk(
  'projects/getStats',
  async (_, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await projectService.getProjectStats(userInfo.token);
    } catch (error) {
      // Return empty data instead of rejecting
      console.error('Error fetching project stats:', error);
      return {
        statusCounts: [],
        avgTimelines: {},
        upcomingInstallations: [],
        projectsByMonth: []
      };
    }
  }
);

// Create a new project
export const createProject = createAsyncThunk(
  'projects/create',
  async (projectData, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await projectService.createProject(projectData, userInfo.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Convert proposal to project
export const convertProposalToProject = createAsyncThunk(
  'projects/convertFromProposal',
  async (proposalId, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      const { proposals } = thunkAPI.getState().proposals;
      
      // Find the proposal by ID
      const proposal = proposals.find(p => p._id === proposalId);
      
      if (!proposal) {
        throw new Error('Proposal not found');
      }
      
      if (proposal.status !== 'accepted') {
        throw new Error('Only accepted proposals can be converted to projects');
      }
      
      // Generate a unique contract number
      const contractNumber = `PRJ${new Date().getFullYear().toString().substr(-2)}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      // Create project data that matches the backend model requirements
      const projectData = {
        proposal: proposal._id, // This is required by the backend
        contractNumber,
        estimatedInstallDate: proposal.estimatedInstallDate,
        notes: `Project created from proposal ${proposal._id}. \n\n${proposal.notes || ''}`
      };

      console.log('Converting proposal to project with data:', projectData);
      
      // Create the project
      const response = await thunkAPI.dispatch(createProject(projectData)).unwrap();
      
      // Update the proposal to mark it as converted
      await thunkAPI.dispatch(updateProposal({
        id: proposalId,
        proposalData: {
          ...proposal,
          status: 'accepted',
          convertedToProject: true,
          projectId: response._id,
          conversionDate: new Date().toISOString()
        }
      })).unwrap();
      
      return response;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message || 'Failed to convert proposal to project');
    }
  }
);

// Update a project
export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, projectData }, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await projectService.updateProject(id, projectData, userInfo.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Create the project slice
export const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    resetProjects: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    resetProject: (state) => {
      state.project = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all projects
      .addCase(getProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.projects = action.payload.projects;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload || 'Failed to fetch projects';
        // Provide empty data to prevent component errors
        state.projects = [];
        state.page = 1;
        state.pages = 1;
      })
      // Get project by ID
      .addCase(getProjectById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.project = action.payload;
      })
      .addCase(getProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get project statistics
      .addCase(getProjectStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProjectStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.projectStats = action.payload;
      })
      .addCase(getProjectStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create a project
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.projects.push(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update a project
      .addCase(updateProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.project = action.payload;
        state.projects = state.projects.map(project => 
          project._id === action.payload._id ? action.payload : project
        );
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Convert proposal to project
      .addCase(convertProposalToProject.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(convertProposalToProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.project = action.payload;
        state.projects.push(action.payload);
      })
      .addCase(convertProposalToProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { resetProjects, resetProject } = projectSlice.actions;
export default projectSlice.reducer;