import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerService from './customerService';

const initialState = {
  customers: [],
  customer: null,
  customerHistory: null,
  customerStats: null,
  page: 1,
  pages: 1,
  total: 0,
  isLoading: false,
  isError: false,
  isSuccess: false,
  message: '',
};

// Get all customers
export const getCustomers = createAsyncThunk(
  'customers/getCustomers',
  async (params = {}, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await customerService.getCustomers(userInfo.token, params);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Get customer by ID
export const getCustomerById = createAsyncThunk(
  'customers/getCustomerById',
  async (id, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await customerService.getCustomerById(id, userInfo.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Create customer
export const createCustomer = createAsyncThunk(
  'customers/createCustomer',
  async (customerData, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await customerService.createCustomer(customerData, userInfo.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Update customer
export const updateCustomer = createAsyncThunk(
  'customers/updateCustomer',
  async ({ id, customerData }, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await customerService.updateCustomer(id, customerData, userInfo.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Get customer history
export const getCustomerHistory = createAsyncThunk(
  'customers/getCustomerHistory',
  async (id, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await customerService.getCustomerHistory(id, userInfo.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

// Get customer stats
export const getCustomerStats = createAsyncThunk(
  'customers/getCustomerStats',
  async (_, thunkAPI) => {
    try {
      const { userInfo } = thunkAPI.getState().auth;
      return await customerService.getCustomerStats(userInfo.token);
    } catch (error) {
      return thunkAPI.rejectWithValue(error);
    }
  }
);

export const customerSlice = createSlice({
  name: 'customers',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.isSuccess = false;
      state.message = '';
    },
    resetCustomer: (state) => {
      state.customer = null;
    },
    resetCustomerHistory: (state) => {
      state.customerHistory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getCustomers.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.customers = action.payload.customers;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
        state.total = action.payload.total;
      })
      .addCase(getCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getCustomerById.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCustomerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.customer = action.payload;
      })
      .addCase(getCustomerById.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createCustomer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.customers.unshift(action.payload);
      })
      .addCase(createCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(updateCustomer.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateCustomer.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.customer = action.payload;
        // Update customer in customers array
        state.customers = state.customers.map((customer) =>
          customer._id === action.payload._id ? action.payload : customer
        );
      })
      .addCase(updateCustomer.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getCustomerHistory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCustomerHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.customerHistory = action.payload;
      })
      .addCase(getCustomerHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getCustomerStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getCustomerStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.customerStats = action.payload;
      })
      .addCase(getCustomerStats.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset, resetCustomer, resetCustomerHistory } = customerSlice.actions;
export default customerSlice.reducer;