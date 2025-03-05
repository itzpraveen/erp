import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import projectService from './projectService';

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
  projectStats: null
};

// Get all projects
export const getProjects = createAsyncThunk(
  'projects/getAll',
  async (params, thunkAPI) => {
    try {
      // This would be a real API call in a complete implementation
      // For now, return mock data
      return {
        projects: [
          {
            _id: '1',
            name: '35KW On-Grid Plant',
            customer: 'KM Rexine',
            location: 'Perinthalmanna',
            status: 'planning',
            contractNumber: 'PRJ2023-001',
            startDate: '2023-03-15',
            targetCompletionDate: '2023-05-20',
            progress: 25,
            type: 'on-grid',
            capacity: 35
          },
          {
            _id: '2',
            name: '10KW Hybrid System',
            customer: 'Govt FHC',
            location: 'Kakkodi, Kozhikode',
            status: 'testing',
            contractNumber: 'PRJ2023-002',
            startDate: '2023-02-10',
            targetCompletionDate: '2023-03-30',
            progress: 90,
            type: 'hybrid',
            capacity: 10
          },
          {
            _id: '3',
            name: '20KW On-Grid Installation',
            customer: 'Janatha Home World',
            location: 'Perinthalmanna',
            status: 'installation',
            contractNumber: 'PRJ2023-003',
            startDate: '2023-02-25',
            targetCompletionDate: '2023-04-15',
            progress: 65,
            type: 'on-grid',
            capacity: 20
          },
          {
            _id: '4',
            name: '5KW Off-Grid System',
            customer: 'Rajan Residence',
            location: 'Wayanad',
            status: 'completed',
            contractNumber: 'PRJ2023-004',
            startDate: '2023-01-10',
            targetCompletionDate: '2023-02-15',
            progress: 100,
            type: 'off-grid',
            capacity: 5
          },
          {
            _id: '5',
            name: '15KW Hybrid System',
            customer: 'Green Valley Resort',
            location: 'Munnar',
            status: 'planning',
            contractNumber: 'PRJ2023-005',
            startDate: '2023-03-25',
            targetCompletionDate: '2023-05-30',
            progress: 10,
            type: 'hybrid',
            capacity: 15
          }
        ],
        page: 1,
        pages: 1
      };
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
      // This would be a real API call in a complete implementation
      // For now, return mock data
      return {
        _id: id,
        name: 'Sample Project',
        customer: {
          _id: 'customer1',
          name: 'Rajan Sharma',
          email: 'rajan.sharma@example.com',
          phone: '+91 9876543210'
        },
        contractNumber: `PRJ-${id.substring(0, 4)}`,
        location: 'Sample Location',
        type: 'on-grid',
        startDate: '2023-03-15',
        targetCompletionDate: '2023-05-20',
        capacity: 25,
        notes: 'Sample project notes',
        budget: 150000,
        status: 'planning'
      };
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
      // This would be a real API call in a complete implementation
      // For now, return mock data
      return {
        statusCounts: [
          { _id: 'planning', count: 2 },
          { _id: 'installation', count: 1 },
          { _id: 'testing', count: 1 },
          { _id: 'completed', count: 1 }
        ],
        typeCounts: [
          { _id: 'on-grid', count: 2 },
          { _id: 'off-grid', count: 1 },
          { _id: 'hybrid', count: 2 }
        ],
        totalProjects: 5,
        active: 4,
        completed: 1,
        totalCapacity: 85
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Create a new project
export const createProject = createAsyncThunk(
  'projects/create',
  async (projectData, thunkAPI) => {
    try {
      // This would be a real API call in a complete implementation
      // For now, return mock data
      return {
        ...projectData,
        _id: 'new-project-id'
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Update a project
export const updateProject = createAsyncThunk(
  'projects/update',
  async ({ id, projectData }, thunkAPI) => {
    try {
      // This would be a real API call in a complete implementation
      // For now, return mock data
      return {
        ...projectData,
        _id: id
      };
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
        state.message = action.payload;
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
      });
  }
});

export const { resetProjects, resetProject } = projectSlice.actions;
export default projectSlice.reducer;