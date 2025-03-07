import React, { lazy } from 'react';

// Define route configurations with metadata
// This approach allows for:
// 1. Centralized route management
// 2. Code splitting by module/feature
// 3. Adding metadata like auth requirements

// Common components used across multiple routes - lazy loaded separately
export const lazyComponents = {
  // Component for displaying forms - used in multiple places
  FormContainer: lazy(() => 
    import(/* webpackChunkName: "form-components" */ '../components/common/FormContainer')
  ),
  
  // Data tables component - used across multiple modules
  DataTable: lazy(() => 
    import(/* webpackChunkName: "table-components" */ '../components/common/DataTable')
  ),
  
  // PDF export functionality - only loaded when needed
  PDFExporter: lazy(() => 
    import(/* webpackChunkName: "pdf-exporter" */ '../components/common/PDFExporter')
  )
};

// Define route configurations
export const routeConfig = [
  {
    path: '/',
    component: lazy(() => import(/* webpackChunkName: "home" */ '../pages/HomePage')),
    exact: true,
    public: true
  },
  {
    path: '/login',
    component: lazy(() => import(/* webpackChunkName: "auth" */ '../pages/LoginPage')),
    exact: true,
    public: true
  },
  {
    path: '/dashboard',
    component: lazy(() => import(/* webpackChunkName: "dashboard" */ '../pages/DashboardPage')),
    exact: true,
    public: false
  },
  
  // Leads module
  {
    path: '/leads',
    component: lazy(() => import(/* webpackChunkName: "leads-list" */ '../pages/LeadsPage')),
    exact: true,
    public: false
  },
  {
    path: '/leads/create',
    component: lazy(() => import(/* webpackChunkName: "lead-details" */ '../pages/LeadDetailsPage')),
    props: { mode: 'create' },
    exact: true,
    public: false
  },
  {
    path: '/leads/:id',
    component: lazy(() => import(/* webpackChunkName: "lead-details" */ '../pages/LeadDetailsPage')),
    exact: true,
    public: false
  },
  {
    path: '/leads/:id/edit',
    component: lazy(() => import(/* webpackChunkName: "lead-details" */ '../pages/LeadDetailsPage')),
    props: { mode: 'edit' },
    exact: true, 
    public: false
  },
  
  // Proposals module
  {
    path: '/proposals',
    component: lazy(() => import(/* webpackChunkName: "proposals-list" */ '../pages/ProposalsPage')),
    exact: true,
    public: false
  },
  {
    path: '/proposals/create',
    component: lazy(() => import(/* webpackChunkName: "proposal-details" */ '../pages/ProposalDetailsPage')),
    props: { mode: 'create' },
    exact: true,
    public: false
  },
  {
    path: '/proposals/:id',
    component: lazy(() => import(/* webpackChunkName: "proposal-details" */ '../pages/ProposalDetailsPage')),
    exact: true,
    public: false
  },
  {
    path: '/proposals/:id/edit',
    component: lazy(() => import(/* webpackChunkName: "proposal-details" */ '../pages/ProposalDetailsPage')),
    props: { mode: 'edit' },
    exact: true,
    public: false
  },
  {
    path: '/proposals/:id/approval',
    component: lazy(() => import(/* webpackChunkName: "proposal-approval" */ '../pages/ProposalApprovalPage')),
    exact: true,
    public: false
  },
  
  // Project management module
  {
    path: '/projects',
    component: lazy(() => import(/* webpackChunkName: "projects-list" */ '../pages/ProjectsPage')),
    exact: true,
    public: false
  },
  {
    path: '/projects/create',
    component: lazy(() => import(/* webpackChunkName: "project-details" */ '../pages/ProjectDetailsPage')),
    props: { mode: 'create' },
    exact: true,
    public: false
  },
  {
    path: '/projects/:id',
    component: lazy(() => import(/* webpackChunkName: "project-details" */ '../pages/ProjectDetailsPage')),
    exact: true,
    public: false
  },
  {
    path: '/projects/:id/edit',
    component: lazy(() => import(/* webpackChunkName: "project-details" */ '../pages/ProjectDetailsPage')),
    props: { mode: 'edit' },
    exact: true,
    public: false
  },
  
  // Service requests module
  {
    path: '/service-requests',
    component: lazy(() => import(/* webpackChunkName: "service-list" */ '../pages/ServiceRequestsPage')),
    exact: true,
    public: false
  },
  {
    path: '/service-requests/create',
    component: lazy(() => import(/* webpackChunkName: "service-details" */ '../pages/ServiceRequestDetailsPage')),
    props: { mode: 'create' },
    exact: true,
    public: false
  },
  {
    path: '/service-requests/:id',
    component: lazy(() => import(/* webpackChunkName: "service-details" */ '../pages/ServiceRequestDetailsPage')),
    exact: true,
    public: false
  },
  {
    path: '/service-requests/:id/edit',
    component: lazy(() => import(/* webpackChunkName: "service-details" */ '../pages/ServiceRequestDetailsPage')),
    props: { mode: 'edit' },
    exact: true,
    public: false
  },
  
  // Customers module
  {
    path: '/customers',
    component: lazy(() => import(/* webpackChunkName: "customers-list" */ '../pages/CustomersPage')),
    exact: true,
    public: false
  },
  {
    path: '/customers/create',
    component: lazy(() => import(/* webpackChunkName: "customer-details" */ '../pages/CustomerDetailsPage')),
    props: { mode: 'create' },
    exact: true,
    public: false
  },
  {
    path: '/customers/:id',
    component: lazy(() => import(/* webpackChunkName: "customer-details" */ '../pages/CustomerDetailsPage')),
    exact: true,
    public: false
  },
  {
    path: '/customers/:id/edit',
    component: lazy(() => import(/* webpackChunkName: "customer-details" */ '../pages/CustomerDetailsPage')),
    props: { mode: 'edit' },
    exact: true,
    public: false
  },
  
  // User management module
  {
    path: '/users',
    component: lazy(() => import(/* webpackChunkName: "users-list" */ '../pages/UsersPage')),
    exact: true,
    public: false,
    adminOnly: true
  },
  {
    path: '/user-management',
    component: lazy(() => import(/* webpackChunkName: "user-management" */ '../pages/UserManagementPage')),
    exact: true,
    public: false,
    adminOnly: true
  }
];