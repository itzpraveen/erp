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
  Badge,
} from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getProposals, resetProposals } from '../features/proposals/proposalSlice';

const ProposalsPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const { proposals, page, pages, isLoading, isError, message, isSuccess } = useSelector(
    (state) => state.proposals
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

  // Main effect to check auth and load proposals
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      console.log('Fetching proposals data...', { currentPage, statusFilter, refreshKey });
      
      // Clear any previous data to prevent stale displays
      dispatch(resetProposals());
      
      // Fetch proposals with current filters
      dispatch(
        getProposals({
          page: currentPage,
          status: statusFilter,
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
      dispatch(resetProposals());
    };
  }, [dispatch]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  // Helper function to get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'sent':
        return 'primary';
      case 'negotiating':
        return 'warning';
      case 'accepted':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Proposals</h1>
        </Col>
        <Col className="text-end">
          <Button 
            onClick={refreshData} 
            variant="outline-primary" 
            className="me-2"
          >
            <i className="fas fa-sync-alt"></i> Refresh
          </Button>
          <Link to="/proposals/create">
            <Button className="my-3">
              <i className="fas fa-plus"></i> Create Proposal
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
          <Form.Select
            value={statusFilter}
            onChange={handleFilterChange}
          >
            <option value="">All Proposals</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="negotiating">Negotiating</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </Form.Select>
        </Col>
      </Row>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{message}</Message>
      ) : (
        <>
          {proposals.length === 0 ? (
            <Message>
              No proposals found. {statusFilter ? 'Try changing the filter or ' : ''}
              <Link to="/proposals/create">create a new proposal</Link> to get started.
            </Message>
          ) : (
            <>
              <Table striped bordered hover responsive className="table-sm">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Lead</th>
                    <th>System Size</th>
                    <th>Total Cost</th>
                    <th>Status</th>
                    <th>Created Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((proposal) => (
                    <tr key={proposal._id}>
                      <td>{proposal.title}</td>
                      <td>
                        {proposal.lead?.name || 'N/A'}
                      </td>
                      <td>
                        {proposal.systemDetails?.totalCapacity 
                          ? `${proposal.systemDetails.totalCapacity} kW` 
                          : 'N/A'}
                      </td>
                      <td>
                        {proposal.financialDetails?.totalCost 
                          ? formatCurrency(proposal.financialDetails.totalCost) 
                          : 'N/A'}
                      </td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(proposal.status)}>
                          {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
                        </Badge>
                      </td>
                      <td>{new Date(proposal.createdAt).toLocaleDateString()}</td>
                      <td>
                        <Button as={Link} to={`/proposals/${proposal._id}`} variant="light" size="sm">
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

export default ProposalsPage;