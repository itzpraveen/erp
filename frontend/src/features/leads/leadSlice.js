import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  leads: [],
  lead: null,
  leadStats: null,
  page: 1,
  pages: 1,
  total: 0,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get all leads
export const getLeads = createAsyncThunk(
  'leads/getLeads',
  async (params = {}, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        params,
      };

      const { data } = await api.get('/api/leads', config);
      return data;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get lead by ID
export const getLeadById = createAsyncThunk(
  'leads/getLeadById',
  async (id, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await api.get(`/api/leads/${id}`, config);
      return data;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create lead
export const createLead = createAsyncThunk(
  'leads/createLead',
  async (leadData, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await api.post('/api/leads', leadData, config);
      return data;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Update lead
export const updateLead = createAsyncThunk(
  'leads/updateLead',
  async ({ id, leadData }, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await api.put(`/api/leads/${id}`, leadData, config);
      return data;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Assign lead
export const assignLead = createAsyncThunk(
  'leads/assignLead',
  async ({ id, userId }, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await api.put(
        `/api/leads/${id}/assign`,
        { userId },
        config
      );
      return data;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get lead stats
export const getLeadStats = createAsyncThunk(
  'leads/getLeadStats',
  async (_, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await api.get('/api/leads/stats', config);
      return data;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    resetLead: (state) => {
      state.lead = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getLeads.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLeads.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.leads = action.payload.leads;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(getLeads.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getLeadById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLeadById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.lead = action.payload;
      })
      .addCase(getLeadById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createLead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.leads.unshift(action.payload);
      })
      .addCase(createLead.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateLead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.lead = action.payload;
        // Update lead in leads array
        state.leads = state.leads.map((lead) =>
          lead._id === action.payload._id ? action.payload : lead
        );
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(assignLead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(assignLead.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.lead = action.payload;
        // Update lead in leads array
        state.leads = state.leads.map((lead) =>
          lead._id === action.payload._id ? action.payload : lead
        );
      })
      .addCase(assignLead.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getLeadStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getLeadStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.leadStats = action.payload;
      })
      .addCase(getLeadStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, resetLead } = leadSlice.actions;
export default leadSlice.reducer;