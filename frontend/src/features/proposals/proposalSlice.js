import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

const initialState = {
  proposals: [],
  proposal: null,
  page: 1,
  pages: 1,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};

// Get all proposals
export const getProposals = createAsyncThunk(
  'proposals/getAll',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page);
      if (params.status) queryParams.append('status', params.status);
      if (params.lead) queryParams.append('lead', params.lead);
      
      // Add timestamp for cache busting
      queryParams.append('_', new Date().getTime());
      
      const response = await api.get(`/api/proposals?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch proposals'
      );
    }
  }
);

// Get proposal by ID
export const getProposalById = createAsyncThunk(
  'proposals/getById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/proposals/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch proposal'
      );
    }
  }
);

// Create proposal
export const createProposal = createAsyncThunk(
  'proposals/create',
  async (proposalData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/proposals', proposalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to create proposal'
      );
    }
  }
);

// Update proposal
export const updateProposal = createAsyncThunk(
  'proposals/update',
  async ({ id, proposalData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/proposals/${id}`, proposalData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update proposal'
      );
    }
  }
);

// Delete proposal (soft delete)
export const deleteProposal = createAsyncThunk(
  'proposals/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/proposals/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete proposal'
      );
    }
  }
);

// Add document to proposal
export const addProposalDocument = createAsyncThunk(
  'proposals/addDocument',
  async ({ id, documentData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/proposals/${id}/documents`, documentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add document'
      );
    }
  }
);

const proposalSlice = createSlice({
  name: 'proposals',
  initialState,
  reducers: {
    resetProposals: (state) => {
      state.proposals = [];
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    resetProposal: (state) => {
      state.proposal = null;
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Get all proposals
      .addCase(getProposals.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(getProposals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.proposals = action.payload.proposals;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(getProposals.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Get proposal by ID
      .addCase(getProposalById.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
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
      
      // Create proposal
      .addCase(createProposal.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(createProposal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.proposal = action.payload;
      })
      .addCase(createProposal.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Update proposal
      .addCase(updateProposal.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(updateProposal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.proposal = action.payload;
      })
      .addCase(updateProposal.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Delete proposal
      .addCase(deleteProposal.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(deleteProposal.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.proposals = state.proposals.filter(
          (proposal) => proposal._id !== action.payload
        );
      })
      .addCase(deleteProposal.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      
      // Add document to proposal
      .addCase(addProposalDocument.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
      })
      .addCase(addProposalDocument.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.proposal = action.payload;
      })
      .addCase(addProposalDocument.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetProposals, resetProposal } = proposalSlice.actions;
export default proposalSlice.reducer;