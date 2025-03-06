import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  proposals: [],
  proposal: null,
  proposalStats: null,
  metrics: null,
  page: 1,
  pages: 1,
  total: 0,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get all proposals
export const getProposals = createAsyncThunk(
  'proposals/getProposals',
  async (params = {}, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
        params,
      };

      const { data } = await api.get('/api/proposals', config);
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

// Get proposal by ID
export const getProposalById = createAsyncThunk(
  'proposals/getProposalById',
  async (id, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await api.get(`/api/proposals/${id}`, config);
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

// Create proposal
export const createProposal = createAsyncThunk(
  'proposals/createProposal',
  async (proposalData, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await api.post('/api/proposals', proposalData, config);
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

// Update proposal
export const updateProposal = createAsyncThunk(
  'proposals/updateProposal',
  async ({ id, proposalData }, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await api.put(`/api/proposals/${id}`, proposalData, config);
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

// Delete proposal
export const deleteProposal = createAsyncThunk(
  'proposals/deleteProposal',
  async (id, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await api.delete(`/api/proposals/${id}`, config);
      return id;
    } catch (error) {
      const message =
        error.response && error.response.data.message
          ? error.response.data.message
          : error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Get proposal stats
export const getProposalStats = createAsyncThunk(
  'proposals/getProposalStats',
  async (_, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data } = await api.get('/api/proposals/stats', config);
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

export const proposalSlice = createSlice({
  name: 'proposals',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    resetProposal: (state) => {
      state.proposal = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProposals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProposals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.proposals = action.payload.proposals;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
        state.metrics = action.payload.metrics;
      })
      .addCase(getProposals.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getProposalById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProposalById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.proposal = action.payload;
      })
      .addCase(getProposalById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createProposal.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createProposal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.proposals.unshift(action.payload);
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateProposal.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProposal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.proposal = action.payload;
        // Update proposal in proposals array
        state.proposals = state.proposals.map((proposal) =>
          proposal._id === action.payload._id ? action.payload : proposal
        );
      })
      .addCase(updateProposal.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(deleteProposal.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteProposal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        // Remove proposal from state
        state.proposals = state.proposals.filter(
          (proposal) => proposal._id !== action.payload
        );
      })
      .addCase(deleteProposal.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getProposalStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getProposalStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.proposalStats = action.payload;
      })
      .addCase(getProposalStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, resetProposal } = proposalSlice.actions;
export default proposalSlice.reducer;