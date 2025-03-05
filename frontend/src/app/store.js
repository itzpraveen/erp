import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import leadReducer from '../features/leads/leadSlice';
import proposalReducer from '../features/proposals/proposalSlice';
import serviceRequestReducer from '../features/serviceRequests/serviceRequestSlice';
import projectReducer from '../features/projects/projectSlice';
import customerReducer from '../features/customers/customerSlice';

// Custom middleware to handle network errors
const networkErrorMiddleware = (store) => (next) => (action) => {
  if (action.error && action.payload && action.error.code === 'ERR_NETWORK') {
    // Dispatch a special action to indicate network error
    store.dispatch({
      type: 'app/networkError',
      payload: 'Network error: Unable to connect to the server. Make sure the backend is running.'
    });
    
    // Log error to console
    console.error('Network error in middleware:', action.error);
  }
  
  return next(action);
};

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadReducer,
    proposals: proposalReducer,
    serviceRequests: serviceRequestReducer,
    projects: projectReducer,
    customers: customerReducer,
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(networkErrorMiddleware),
});

export default store;