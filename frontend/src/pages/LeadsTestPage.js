import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import api from '../utils/api';

// A completely separate implementation to test leads listing
const LeadsTestPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Function to fetch leads directly from API
  const fetchLeads = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get token from localStorage
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (!userInfo || !userInfo.token) {
        setError('You must be logged in to view leads');
        setLoading(false);
        return;
      }

      const timestamp = new Date().getTime(); // Cache busting
      const response = await api.get(`/api/leads?_=${timestamp}`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      });

      console.log('API Response:', response.data);
      setLeads(response.data.leads || []);
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError('Failed to fetch leads. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch leads on mount and when refresh count changes
  useEffect(() => {
    fetchLeads();
  }, [refreshCount]);

  // Function to handle refresh button click
  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Leads Test Page</h1>
        <div>
          <Button 
            variant="outline-primary" 
            onClick={handleRefresh} 
            disabled={loading}
            className="me-2"
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </Button>
          <Link to="/leads/create" className="btn btn-primary">
            Create Lead
          </Link>
        </div>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between">
            <span>All Leads (Direct API Implementation)</span>
            <span>{leads.length} leads found</span>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <Alert variant="info">
              No leads found. Click "Create Lead" to add a new lead.
            </Alert>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map(lead => (
                  <tr key={lead._id}>
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>
                      <span className="badge bg-secondary">
                        {lead.status}
                      </span>
                    </td>
                    <td>{new Date(lead.createdAt).toLocaleString()}</td>
                    <td>
                      <Link to={`/leads/${lead._id}`} className="btn btn-sm btn-outline-primary">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
        <Card.Footer className="text-muted">
          Last refreshed: {new Date().toLocaleTimeString()}
        </Card.Footer>
      </Card>
    </div>
  );
};

export default LeadsTestPage;