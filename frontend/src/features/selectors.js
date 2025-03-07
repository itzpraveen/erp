import { createSelector } from '@reduxjs/toolkit';

// Auth selectors
export const selectAuth = state => state.auth;
export const selectIsAuthenticated = state => state.auth.isAuthenticated;
export const selectCurrentUser = state => state.auth.userInfo;
export const selectIsCheckingAuth = state => state.auth.isCheckingAuth;
export const selectIsAdmin = createSelector(
  [selectCurrentUser],
  (user) => user && user.role === 'admin'
);
export const selectUsersList = state => state.auth.users;
export const selectUserById = userId => createSelector(
  [selectUsersList],
  (users) => users ? users.find(user => user._id === userId) : null
);

// Lead selectors
export const selectLeadsState = state => state.leads;
export const selectLeadsList = state => state.leads.leads;
export const selectLeadsTotal = state => state.leads.total;
export const selectLeadsLoading = state => state.leads.isLoading;
export const selectLeadsPagination = createSelector(
  [state => state.leads.page, state => state.leads.pages, state => state.leads.total],
  (page, pages, total) => ({ page, pages, total })
);
export const selectLeadById = leadId => createSelector(
  [selectLeadsList],
  (leads) => leads ? leads.find(lead => lead._id === leadId) : null
);
export const selectLeadStats = state => state.leads.leadStats;
export const selectStatusCounts = createSelector(
  [selectLeadStats],
  (stats) => stats?.statusCounts || []
);
export const selectSourceCounts = createSelector(
  [selectLeadStats],
  (stats) => stats?.sourceCounts || []
);

// Customer selectors
export const selectCustomersState = state => state.customers;
export const selectCustomersList = state => state.customers.customers;
export const selectCustomersLoading = state => state.customers.isLoading;
export const selectCustomersPagination = createSelector(
  [state => state.customers.page, state => state.customers.pages, state => state.customers.total],
  (page, pages, total) => ({ page, pages, total })
);
export const selectCustomerById = customerId => createSelector(
  [selectCustomersList],
  (customers) => customers ? customers.find(customer => customer._id === customerId) : null
);

// Project selectors
export const selectProjectsState = state => state.projects;
export const selectProjectsList = state => state.projects.projects;
export const selectProjectsLoading = state => state.projects.isLoading;
export const selectProjectsPagination = createSelector(
  [state => state.projects.page, state => state.projects.pages, state => state.projects.total],
  (page, pages, total) => ({ page, pages, total })
);
export const selectProjectById = projectId => createSelector(
  [selectProjectsList],
  (projects) => projects ? projects.find(project => project._id === projectId) : null
);

// Proposal selectors
export const selectProposalsState = state => state.proposals;
export const selectProposalsList = state => state.proposals.proposals;
export const selectProposalsLoading = state => state.proposals.isLoading;
export const selectProposalsPagination = createSelector(
  [state => state.proposals.page, state => state.proposals.pages, state => state.proposals.total],
  (page, pages, total) => ({ page, pages, total })
);
export const selectProposalById = proposalId => createSelector(
  [selectProposalsList],
  (proposals) => proposals ? proposals.find(proposal => proposal._id === proposalId) : null
);

// Service Request selectors
export const selectServiceRequestsState = state => state.serviceRequests;
export const selectServiceRequestsList = state => state.serviceRequests.serviceRequests;
export const selectServiceRequestsLoading = state => state.serviceRequests.isLoading;
export const selectServiceRequestsPagination = createSelector(
  [state => state.serviceRequests.page, state => state.serviceRequests.pages, state => state.serviceRequests.total],
  (page, pages, total) => ({ page, pages, total })
);
export const selectServiceRequestById = serviceRequestId => createSelector(
  [selectServiceRequestsList],
  (serviceRequests) => serviceRequests ? serviceRequests.find(sr => sr._id === serviceRequestId) : null
);
