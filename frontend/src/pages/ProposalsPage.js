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
  Card,
} from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { getProposals, getProposalStats, reset } from '../features/proposals/proposalSlice';

const ProposalsPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const { 
    proposals, 
    page, 
    pages, 
    total, 
    metrics,
    isLoading, 
    isError, 
    message,
    isSuccess
  } = useSelector((state) => state.proposals);

  // Function to force a data refresh
  const refreshData = useCallback(() => {
    dispatch(reset());
    
    const params = {};
    if (statusFilter) {
      params.status = statusFilter;
    }
    if (searchTerm) {
      params.search = searchTerm;
    }
    
    dispatch(getProposals(params));
    dispatch(getProposalStats());
    
    setShowRefreshAlert(true);
    
    // Hide the alert after 3 seconds
    setTimeout(() => {
      setShowRefreshAlert(false);
    }, 3000);
  }, [dispatch, statusFilter, searchTerm]);

  // Main effect to check auth and load proposals
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      const params = {};
      if (statusFilter) {
        params.status = statusFilter;
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      
      dispatch(getProposals({ ...params, page: currentPage }));
      dispatch(getProposalStats());
    }
  }, [navigate, userInfo, dispatch, statusFilter, currentPage, searchTerm]);

  // Effect to detect navigation back to this page from other routes
  useEffect(() => {
    // If we have location state with a refresh flag, refresh the data
    if (location.state?.refresh) {
      refreshData();
      // Clear the state to prevent repeated refreshes
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, refreshData]);

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1); // Reset to first page when changing filters
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
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

      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom">
          <h5 className="mb-0"><i className="fas fa-filter me-2 text-primary"></i>Filters</h5>
        </Card.Header>
        <Card.Body className="py-3">
          <Row>
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
            <Col md={6}>
              <Form onSubmit={handleSearchSubmit}>
                <InputGroup>
                  <Form.Control
                    placeholder="Search proposals..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <Button variant="outline-secondary" type="submit">
                    <i className="fas fa-search"></i>
                  </Button>
                  {searchTerm && (
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setSearchTerm('')}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  )}
                </InputGroup>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{message}</Message>
      ) : proposals.length === 0 ? (
        <Message>
          No proposals found. {statusFilter ? 'Try changing the filter or ' : ''}
          <Link to="/proposals/create">create a new proposal</Link> to get started.
        </Message>
      ) : (
        <>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-file-alt me-2 text-primary"></i>
                Proposal List
              </h5>
              <Badge bg="primary" pill>
                {total} proposals
              </Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <Table striped bordered hover responsive className="mb-0">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Lead / Customer</th>
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
                        {proposal.leadName || 'N/A'}
                        {proposal.customerName && (
                          <div className="small text-muted">
                            Customer: {proposal.customerName}
                          </div>
                        )}
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
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => navigate(`/proposals/${proposal._id}`)}
                        >
                          <i className="fas fa-eye me-1"></i> View
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/proposals/${proposal._id}/edit`)}
                        >
                          <i className="fas fa-edit me-1"></i> Edit
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {pages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                />

                {[...Array(pages).keys()].map((x) => (
                  <Pagination.Item
                    key={x + 1}
                    active={x + 1 === currentPage}
                    onClick={() => setCurrentPage(x + 1)}
                  >
                    {x + 1}
                  </Pagination.Item>
                ))}

                <Pagination.Next
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === pages}
                />
                <Pagination.Last
                  onClick={() => setCurrentPage(pages)}
                  disabled={currentPage === pages}
                />
              </Pagination>
            </div>
          )}
          
          {/* Proposal Statistics */}
          {metrics && (
            <Row className="mt-4">
              <Col md={6}>
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-white py-3 border-bottom">
                    <h5 className="mb-0"><i className="fas fa-chart-pie me-2 text-primary"></i>Proposal Status Summary</h5>
                  </Card.Header>
                  <Card.Body>
                    {metrics.statusCounts && metrics.statusCounts.map(status => {
                      const percentage = Math.round((status.count / total) * 100) || 0;
                      let variant;
                      
                      switch(status._id) {
                        case 'draft': variant = 'secondary'; break;
                        case 'sent': variant = 'primary'; break;
                        case 'negotiating': variant = 'warning'; break;
                        case 'accepted': variant = 'success'; break;
                        case 'rejected': variant = 'danger'; break;
                        default: variant = 'secondary';
                      }
                      
                      return (
                        <div key={status._id} className="mb-3">
                          <div className="d-flex justify-content-between align-items-center mb-1">
                            <div>
                              <Badge bg={variant} className="me-2">{status._id.charAt(0).toUpperCase() + status._id.slice(1)}</Badge>
                              <span>{status.count} proposals</span>
                            </div>
                            <span className="text-muted">{percentage}%</span>
                          </div>
                          <div className="progress" style={{ height: '8px' }}>
                            <div 
                              className={`progress-bar bg-${variant}`} 
                              role="progressbar" 
                              style={{ width: `${percentage}%` }}
                              aria-valuenow={percentage}
                              aria-valuemin="0"
                              aria-valuemax="100"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="shadow-sm border-0">
                  <Card.Header className="bg-white py-3 border-bottom">
                    <h5 className="mb-0"><i className="fas fa-dollar-sign me-2 text-success"></i>Financial Summary</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <Card className="text-center mb-3">
                          <Card.Body>
                            <h6 className="text-muted mb-2">Average System Size</h6>
                            <h4 className="mb-0">
                              {metrics.averageSystemSize 
                                ? `${metrics.averageSystemSize.toFixed(1)} kW`
                                : 'N/A'}
                            </h4>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="text-center mb-3">
                          <Card.Body>
                            <h6 className="text-muted mb-2">Average Cost</h6>
                            <h4 className="mb-0">
                              {metrics.averageCost
                                ? formatCurrency(metrics.averageCost)
                                : 'N/A'}
                            </h4>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Card className="text-center">
                          <Card.Body>
                            <h6 className="text-muted mb-2">Total Proposed</h6>
                            <h4 className="mb-0">
                              {total} proposals
                            </h4>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col md={6}>
                        <Card className="text-center">
                          <Card.Body>
                            <h6 className="text-muted mb-2">Acceptance Rate</h6>
                            <h4 className="mb-0">
                              {metrics.statusCounts
                                ? `${Math.round((metrics.statusCounts.find(s => s._id === 'accepted')?.count || 0) / total * 100) || 0}%`
                                : '0%'}
                            </h4>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </>
      )}
    </>
  );
};

export default ProposalsPage;