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
      // This would be a real API call in a complete implementation
      // For now, return mock data
      return {
        serviceRequests: [
          {
            _id: 'serv1',
            title: 'Inverter Troubleshooting',
            customer: {
              _id: 'customer1',
              name: 'Rajan Sharma',
              email: 'rajan.sharma@example.com',
              phone: '+91 9876543210'
            },
            project: null,
            requestType: 'repair',
            status: 'new',
            priority: 'high',
            createdAt: '2023-03-10',
            warrantyRelated: false
          },
          {
            _id: 'serv2',
            title: 'Annual Maintenance',
            customer: {
              _id: 'customer2',
              name: 'Green Valley Resort',
              email: 'management@greenvalley.com',
              phone: '+91 9876543211'
            },
            project: {
              _id: 'proj5',
              contractNumber: 'PRJ2023-005'
            },
            requestType: 'maintenance',
            status: 'scheduled',
            priority: 'medium',
            createdAt: '2023-03-10',
            scheduledDate: '2023-06-15',
            warrantyRelated: false
          },
          {
            _id: 'serv3',
            title: 'Battery Replacement',
            customer: {
              _id: 'customer3',
              name: 'Govt FHC',
              email: 'fhc.kakkodi@gov.in',
              phone: '+91 9876543212'
            },
            project: {
              _id: 'proj2',
              contractNumber: 'PRJ2023-002'
            },
            requestType: 'repair',
            status: 'in_progress',
            priority: 'high',
            createdAt: '2023-03-12',
            scheduledDate: '2023-03-18',
            warrantyRelated: true
          },
          {
            _id: 'serv4',
            title: 'System Performance Check',
            customer: {
              _id: 'customer4',
              name: 'Janatha Home World',
              email: 'info@janathaworld.com',
              phone: '+91 9876543213'
            },
            project: {
              _id: 'proj3',
              contractNumber: 'PRJ2023-003'
            },
            requestType: 'inspection',
            status: 'completed',
            priority: 'medium',
            createdAt: '2023-03-05',
            scheduledDate: '2023-03-15',
            completionDate: '2023-03-15',
            warrantyRelated: false
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

// Get service request by ID
export const getServiceRequestById = createAsyncThunk(
  'serviceRequests/getById',
  async (id, thunkAPI) => {
    try {
      // This would be a real API call in a complete implementation
      // For now, return mock data
      return {
        _id: id,
        title: 'Sample Service Request',
        customer: {
          _id: 'customer1',
          name: 'Rajan Sharma',
          email: 'rajan.sharma@example.com',
          phone: '+91 9876543210',
          address: '123 Main St, Wayanad'
        },
        project: null,
        requestType: 'repair',
        description: 'Customer reported issues with the inverter.',
        status: 'new',
        priority: 'high',
        createdAt: '2023-03-10',
        warrantyRelated: false,
        notes: [
          {
            text: 'Initial contact with customer.',
            createdAt: '2023-03-10T09:00:00Z',
            createdBy: {
              name: 'Admin'
            }
          }
        ]
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Get service request statistics
export const getServiceStats = createAsyncThunk(
  'serviceRequests/getStats',
  async (_, thunkAPI) => {
    try {
      // This would be a real API call in a complete implementation
      // For now, return mock data
      return {
        statusCounts: [
          { _id: 'new', count: 1 },
          { _id: 'assigned', count: 0 },
          { _id: 'scheduled', count: 1 },
          { _id: 'in_progress', count: 1 },
          { _id: 'on_hold', count: 0 },
          { _id: 'completed', count: 1 },
          { _id: 'cancelled', count: 0 }
        ],
        priorityCounts: [
          { _id: 'low', count: 0 },
          { _id: 'medium', count: 2 },
          { _id: 'high', count: 2 },
          { _id: 'critical', count: 0 }
        ],
        typeCounts: [
          { _id: 'maintenance', count: 1 },
          { _id: 'repair', count: 2 },
          { _id: 'inspection', count: 1 },
          { _id: 'warranty_claim', count: 0 },
          { _id: 'system_upgrade', count: 0 },
          { _id: 'other', count: 0 }
        ],
        total: 4,
        active: 3,
        warrantyRelated: 1
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Create a new service request
export const createServiceRequest = createAsyncThunk(
  'serviceRequests/create',
  async (requestData, thunkAPI) => {
    try {
      // This would be a real API call in a complete implementation
      // For now, return mock data
      return {
        ...requestData,
        _id: 'new-service-request-id',
        createdAt: new Date().toISOString(),
        status: 'new'
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Update a service request
export const updateServiceRequest = createAsyncThunk(
  'serviceRequests/update',
  async ({ id, requestData }, thunkAPI) => {
    try {
      // This would be a real API call in a complete implementation
      // For now, return mock data
      return {
        ...requestData,
        _id: id
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Update service request status
export const updateServiceRequestStatus = createAsyncThunk(
  'serviceRequests/updateStatus',
  async ({ id, status, notes }, thunkAPI) => {
    try {
      // This would be a real API call in a complete implementation
      // For now, return mock data
      return {
        _id: id,
        status,
        notes: [
          {
            text: notes,
            createdAt: new Date().toISOString(),
            createdBy: {
              name: 'Admin'
            }
          }
        ]
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Add parts to service request
export const addServiceRequestParts = createAsyncThunk(
  'serviceRequests/addParts',
  async ({ id, parts }, thunkAPI) => {
    try {
      // This would be a real API call in a complete implementation
      // For now, return mock data
      return {
        _id: id,
        partsUsed: parts
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

// Add customer feedback
export const addCustomerFeedback = createAsyncThunk(
  'serviceRequests/addFeedback',
  async ({ id, rating, comments }, thunkAPI) => {
    try {
      // This would be a real API call in a complete implementation
      // For now, return mock data
      return {
        _id: id,
        customerFeedback: {
          rating,
          comments,
          date: new Date().toISOString()
        }
      };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
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
          state.serviceRequest = {
            ...state.serviceRequest,
            status: action.payload.status,
            notes: [
              ...(state.serviceRequest.notes || []),
              ...action.payload.notes
            ]
          };
        }
        state.serviceRequests = state.serviceRequests.map(request => 
          request._id === action.payload._id 
            ? { ...request, status: action.payload.status }
            : request
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
          state.serviceRequest = {
            ...state.serviceRequest,
            partsUsed: [
              ...(state.serviceRequest.partsUsed || []),
              ...action.payload.partsUsed
            ]
          };
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
          state.serviceRequest = {
            ...state.serviceRequest,
            customerFeedback: action.payload.customerFeedback
          };
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