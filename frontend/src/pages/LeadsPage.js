import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Button,
  Table,
  Form,
  InputGroup,
  Pagination,
  Alert,
} from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getLeads, reset } from '../features/leads/leadSlice';

const LeadsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0); // Add a refresh key to force re-fetch
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const { leads, page, pages, isLoading, isError, message } = useSelector(
    (state) => state.leads
  );

  // Function to force a data refresh
  const refreshData = useCallback(() => {
    setRefreshKey(prevKey => prevKey + 1);
    setShowRefreshAlert(true);
    
    // Hide the alert after 3 seconds
    setTimeout(() => {
      setShowRefreshAlert(false);
    }, 3000);
  }, []);

  // Main effect to check auth and load leads
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      console.log('Fetching leads data...', { currentPage, statusFilter, refreshKey });
      
      // Clear any previous data to prevent stale displays
      dispatch(reset());
      
      // Fetch leads with current filters
      dispatch(
        getLeads({
          page: currentPage,
          status: statusFilter,
          _: new Date().getTime(), // Add cache-busting timestamp
        })
      );
    }
  }, [dispatch, navigate, userInfo, currentPage, statusFilter, refreshKey]);

  // Effect to detect navigation back to this page from other routes
  useEffect(() => {
    // If we have location state with a refresh flag, refresh the data
    if (location.state?.refresh) {
      refreshData();
      // Clear the state to prevent repeated refreshes
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, refreshData]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearch = (e) => {
    e.preventDefault();
    // Not yet implemented in the backend
    console.log('Searching for:', searchTerm);
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Leads</h1>
        </Col>
        <Col className="text-end">
          <Button 
            onClick={refreshData} 
            variant="outline-primary" 
            className="me-2"
          >
            <i className="fas fa-sync-alt"></i> Refresh
          </Button>
          <Link to="/leads/create">
            <Button className="my-3">
              <i className="fas fa-plus"></i> Create Lead
            </Button>
          </Link>
        </Col>
      </Row>

      {showRefreshAlert && (
        <Alert variant="info" dismissible onClose={() => setShowRefreshAlert(false)}>
          <i className="fas fa-sync-alt fa-spin me-2"></i>
          Data refreshed successfully!
        </Alert>
      )}

      <Row className="mb-3">
        <Col md={6}>
          <Form onSubmit={handleSearch}>
            <InputGroup>
              <Form.Control
                type="text"
                placeholder="Search leads..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button type="submit" variant="outline-secondary">
                Search
              </Button>
            </InputGroup>
          </Form>
        </Col>
        <Col md={6}>
          <Form.Select
            value={statusFilter}
            onChange={handleFilterChange}
          >
            <option value="">All Leads</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal">Proposal</option>
            <option value="closed_won">Closed Won</option>
            <option value="closed_lost">Closed Lost</option>
          </Form.Select>
        </Col>
      </Row>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{message}</Message>
      ) : (
        <>
          {leads.length === 0 ? (
            <Message>
              No leads found. {statusFilter ? 'Try changing the filter or ' : ''}
              <Link to="/leads/create">create a new lead</Link> to get started.
            </Message>
          ) : (
            <>
              <Table striped bordered hover responsive className="table-sm">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Status</th>
                    <th>Source</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead._id}>
                      <td>{lead.name}</td>
                      <td>
                        <a href={`mailto:${lead.email}`}>{lead.email}</a>
                      </td>
                      <td>
                        <a href={`tel:${lead.phone}`}>{lead.phone}</a>
                      </td>
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
                      <td>{lead.source}</td>
                      <td>{new Date(lead.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button as={Link} to={`/leads/${lead._id}`} variant="light" size="sm">
                          <i className="fas fa-eye"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {pages > 1 && (
                <Pagination>
                  {[...Array(pages).keys()].map((x) => (
                    <Pagination.Item
                      key={x + 1}
                      active={x + 1 === page}
                      onClick={() => paginate(x + 1)}
                    >
                      {x + 1}
                    </Pagination.Item>
                  ))}
                </Pagination>
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default LeadsPage;