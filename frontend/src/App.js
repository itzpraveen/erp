import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import WebSocketNotifications from './components/WebSocketNotifications';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import LeadDetailsPage from './pages/LeadDetailsPage';
import ProposalsPage from './pages/ProposalsPage';
import ProposalDetailsPage from './pages/ProposalDetailsPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import ServiceRequestsPage from './pages/ServiceRequestsPage';
import ServiceRequestDetailsPage from './pages/ServiceRequestDetailsPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailsPage from './pages/CustomerDetailsPage';
import UsersPage from './pages/UsersPage';


// Styles
import './App.css';

const App = () => {
  return (
    <Router>
      <Header />
      {/* WebSocket notifications are disabled to prevent connection errors */}
      {/* <WebSocketNotifications /> */}
      <main className="py-3">
        <Container>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadsPage />} />

            <Route path="/leads/create" element={<LeadDetailsPage mode="create" />} />
            <Route path="/leads/:id" element={<LeadDetailsPage />} />
            <Route path="/leads/:id/edit" element={<LeadDetailsPage mode="edit" />} />
            <Route path="/proposals" element={<ProposalsPage />} />
            <Route path="/proposals/create" element={<ProposalDetailsPage mode="create" />} />
            <Route path="/proposals/:id" element={<ProposalDetailsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/create" element={<ProjectDetailsPage mode="create" />} />
            <Route path="/projects/:id" element={<ProjectDetailsPage />} />
            <Route path="/projects/:id/edit" element={<ProjectDetailsPage mode="edit" />} />
            <Route path="/service-requests" element={<ServiceRequestsPage />} />
            <Route path="/service-requests/create" element={<ServiceRequestDetailsPage mode="create" />} />
            <Route path="/service-requests/:id" element={<ServiceRequestDetailsPage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/customers/create" element={<CustomerDetailsPage mode="create" />} />
            <Route path="/customers/:id" element={<CustomerDetailsPage />} />
            <Route path="/customers/:id/edit" element={<CustomerDetailsPage mode="edit" />} />
            <Route path="/users" element={<UsersPage />} />
          </Routes>
        </Container>
      </main>
      <Footer />
    </Router>
  );
};

export default App;