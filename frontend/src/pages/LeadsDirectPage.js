import React, { useState, useEffect } from 'react';
import { Button, Table, Card, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const LeadsDirectPage = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshTime, setRefreshTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    loadLeads();
  }, []);

  // This is a direct browser-fetch implementation that bypasses Redux entirely
  const loadLeads = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get auth token
      const userInfoStr = localStorage.getItem('userInfo');
      if (!userInfoStr) {
        setError('You must be logged in to view leads');
        setLoading(false);
        return;
      }
      
      const userInfo = JSON.parse(userInfoStr);
      const token = userInfo.token;
      
      if (!token) {
        setError('Invalid authentication. Please log in again.');
        setLoading(false);
        return;
      }
      
      // Add a cache-busting parameter
      const timestamp = new Date().getTime();
      const response = await fetch(`http://localhost:5001/api/leads?nocache=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Leads fetched directly:', data);
      
      if (data && Array.isArray(data.leads)) {
        setLeads(data.leads);
      } else {
        console.error('Invalid response format:', data);
        setError('Received invalid data format from server');
      }
      
      setRefreshTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching leads:', err);
      setError(`Failed to load leads: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Leads Direct Implementation</h1>
        <div>
          <Button
            variant="warning"
            onClick={loadLeads}
            disabled={loading}
            className="me-2"
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" /> Loading...
              </>
            ) : (
              'Refresh Leads'
            )}
          </Button>
          <Link to="/leads/create" className="btn btn-primary">
            Create Lead
          </Link>
        </div>
      </div>

      <Alert variant="info">
        <i className="fas fa-info-circle me-2"></i>
        This page uses a direct browser fetch implementation that bypasses Redux
        entirely. It should always show the latest data from the database.
      </Alert>

      {error && (
        <Alert variant="danger">
          <i className="fas fa-exclamation-triangle me-2"></i>
          {error}
        </Alert>
      )}

      <Card>
        <Card.Header>
          <div className="d-flex justify-content-between">
            <span>All Leads</span>
            <span>
              {leads.length} lead{leads.length !== 1 ? 's' : ''} found
            </span>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <p className="mt-3">Loading leads...</p>
            </div>
          ) : leads.length === 0 ? (
            <Alert variant="warning">
              No leads found. Click "Create Lead" to add a new lead.
            </Alert>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>{lead._id.substring(lead._id.length - 6)}</td>
                    <td>{lead.name}</td>
                    <td>{lead.email}</td>
                    <td>
                      <span
                        className={`badge ${
                          lead.status === 'closed_won'
                            ? 'bg-success'
                            : lead.status === 'closed_lost'
                            ? 'bg-danger'
                            : lead.status === 'proposal'
                            ? 'bg-info'
                            : lead.status === 'qualified'
                            ? 'bg-primary'
                            : 'bg-secondary'
                        }`}
                      >
                        {lead.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      {new Date(lead.createdAt).toLocaleString()}
                    </td>
                    <td>
                      <Link
                        to={`/leads/${lead._id}`}
                        className="btn btn-sm btn-primary"
                      >
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
          Last refreshed: {refreshTime}
        </Card.Footer>
      </Card>
    </div>
  );
};

export default LeadsDirectPage;