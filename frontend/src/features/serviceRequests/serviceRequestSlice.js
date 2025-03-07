import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import serviceRequestService from './serviceRequestService';

// Initial state
const initialState = {
  serviceRequests: [],
  serviceRequest: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
  page: 1,
  pages: 1,
  serviceStats: null
};

// Get all service requests
export const getServiceRequests = createAsyncThunk(
  'serviceRequests/getAll',
  async (params, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await serviceRequestService.getServiceRequests(
        userInfo.token,
        params
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Get service request by ID
export const getServiceRequestById = createAsyncThunk(
  'serviceRequests/getById',
  async (id, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await serviceRequestService.getServiceRequestById(
        id,
        userInfo.token
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Get service request statistics
export const getServiceStats = createAsyncThunk(
  'serviceRequests/getStats',
  async (_, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await serviceRequestService.getServiceStats(userInfo.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Create a new service request
export const createServiceRequest = createAsyncThunk(
  'serviceRequests/create',
  async (requestData, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await serviceRequestService.createServiceRequest(
        requestData,
        userInfo.token
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Update a service request
export const updateServiceRequest = createAsyncThunk(
  'serviceRequests/update',
  async ({ id, requestData }, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await serviceRequestService.updateServiceRequest(
        id,
        requestData,
        userInfo.token
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Update service request status
export const updateServiceRequestStatus = createAsyncThunk(
  'serviceRequests/updateStatus',
  async ({ id, status, notes }, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await serviceRequestService.updateServiceRequestStatus(
        id,
        { status, notes },
        userInfo.token
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Add parts to service request
export const addServiceRequestParts = createAsyncThunk(
  'serviceRequests/addParts',
  async ({ id, parts }, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await serviceRequestService.addServiceRequestParts(
        id,
        { parts },
        userInfo.token
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Add customer feedback
export const addCustomerFeedback = createAsyncThunk(
  'serviceRequests/addFeedback',
  async ({ id, rating, comments }, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await serviceRequestService.addCustomerFeedback(
        id,
        { rating, comments },
        userInfo.token
      );
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Create the service request slice
export const serviceRequestSlice = createSlice({
  name: 'serviceRequests',
  initialState,
  reducers: {
    resetServiceRequests: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
      // Don't clear the data array to avoid flashing
    },
    resetServiceRequest: (state) => {
      state.serviceRequest = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all service requests
      .addCase(getServiceRequests.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getServiceRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.serviceRequests = action.payload.serviceRequests;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(getServiceRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get service request by ID
      .addCase(getServiceRequestById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getServiceRequestById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.serviceRequest = action.payload;
      })
      .addCase(getServiceRequestById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Get service statistics
      .addCase(getServiceStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getServiceStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.serviceStats = action.payload;
      })
      .addCase(getServiceStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Create service request
      .addCase(createServiceRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createServiceRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.serviceRequests.push(action.payload);
      })
      .addCase(createServiceRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update service request
      .addCase(updateServiceRequest.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateServiceRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.serviceRequest = action.payload;
        state.serviceRequests = state.serviceRequests.map(request => 
          request._id === action.payload._id ? action.payload : request
        );
      })
      .addCase(updateServiceRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Update service request status
      .addCase(updateServiceRequestStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateServiceRequestStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (state.serviceRequest && state.serviceRequest._id === action.payload._id) {
          state.serviceRequest = action.payload;
        }
        state.serviceRequests = state.serviceRequests.map(request => 
          request._id === action.payload._id ? action.payload : request
        );
      })
      .addCase(updateServiceRequestStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Add parts to service request
      .addCase(addServiceRequestParts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addServiceRequestParts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (state.serviceRequest && state.serviceRequest._id === action.payload._id) {
          state.serviceRequest = action.payload;
        }
      })
      .addCase(addServiceRequestParts.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      // Add customer feedback
      .addCase(addCustomerFeedback.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addCustomerFeedback.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        if (state.serviceRequest && state.serviceRequest._id === action.payload._id) {
          state.serviceRequest = action.payload;
        }
      })
      .addCase(addCustomerFeedback.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  }
});

export const { resetServiceRequests, resetServiceRequest } = serviceRequestSlice.actions;
export default serviceRequestSlice.reducer;