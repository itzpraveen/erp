import React, { useEffect, useState } from 'react';
import { Row, Col, Button, Card, Table, Badge, Form, Pagination } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { formatDate, formatStatus } from '../utils/formatters';
import { getServiceRequests, resetServiceRequests } from '../features/serviceRequests/serviceRequestSlice';

const ServiceRequestsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get state from Redux store
  const { serviceRequests, page, pages, isLoading, isError, message } = useSelector(
    (state) => state.serviceRequests
  );
  const { userInfo } = useSelector((state) => state.auth);

  // Filter states
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [warrantyFilter, setWarrantyFilter] = useState('');

  // Check if filters are applied
  const hasFilters = statusFilter || priorityFilter || typeFilter || warrantyFilter;

  // Fetch service requests when component mounts or filters change
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (typeFilter) params.requestType = typeFilter;
      if (warrantyFilter) params.warrantyRelated = warrantyFilter === 'yes';

      // Always fetch fresh data from the database
      dispatch(getServiceRequests(params));
    }

    // Clean up function - don't reset on unmount to avoid data flashing
    return () => {};
  }, [dispatch, navigate, userInfo, statusFilter, priorityFilter, typeFilter, warrantyFilter]);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    const params = { page: pageNumber };
    if (statusFilter) params.status = statusFilter;
    if (priorityFilter) params.priority = priorityFilter;
    if (typeFilter) params.requestType = typeFilter;
    if (warrantyFilter) {
      params.warrantyRelated = warrantyFilter === 'yes';
    }

    dispatch(getServiceRequests(params));
  };

  // Reset all filters
  const resetFilters = () => {
    setStatusFilter('');
    setPriorityFilter('');
    setTypeFilter('');
    setWarrantyFilter('');
  };

  // Get status badge variant
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'new':
        return 'info';
      case 'assigned':
        return 'primary';
      case 'scheduled':
        return 'warning';
      case 'in_progress':
        return 'primary';
      case 'on_hold':
        return 'secondary';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'danger';
      default:
        return 'light';
    }
  };

  // Get priority badge variant
  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'danger';
      case 'critical':
        return 'dark';
      default:
        return 'light';
    }
  };

  // Format request type
  const formatRequestType = (type) => {
    return formatStatus(type);
  };

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="mb-0"><i className="fas fa-tools me-3 text-primary"></i>Service Requests</h1>
          <p className="text-muted mt-2 mb-0">Manage customer service and maintenance requests</p>
        </Col>
        <Col className="text-end">
          <Link to="/service-requests/create">
            <Button className="my-3" size="lg">
              <i className="fas fa-plus me-2"></i> Create Service Request
            </Button>
          </Link>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom">
          <h5 className="mb-0"><i className="fas fa-filter me-2 text-primary"></i>Filters</h5>
        </Card.Header>
        <Card.Body className="py-4">
          <Row>
            <Col md={3}>
              <Form.Group controlId="statusFilter" className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="assigned">Assigned</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group controlId="priorityFilter" className="mb-3">
                <Form.Label>Priority</Form.Label>
                <Form.Select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group controlId="typeFilter" className="mb-3">
                <Form.Label>Request Type</Form.Label>
                <Form.Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">All Types</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="repair">Repair</option>
                  <option value="inspection">Inspection</option>
                  <option value="warranty_claim">Warranty Claim</option>
                  <option value="system_upgrade">System Upgrade</option>
                  <option value="other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group controlId="warrantyFilter" className="mb-3">
                <Form.Label>Warranty Related</Form.Label>
                <Form.Select
                  value={warrantyFilter}
                  onChange={(e) => setWarrantyFilter(e.target.value)}
                >
                  <option value="">All</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end">
            <Button
              variant="outline-secondary"
              onClick={resetFilters}
              className="me-2"
              disabled={!hasFilters}
            >
              Reset Filters
            </Button>
          </div>
        </Card.Body>
      </Card>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{message}</Message>
      ) : serviceRequests.length === 0 ? (
        <Message variant="info">
          No service requests found
          {hasFilters && " matching the selected filters"}
        </Message>
      ) : (
        <>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="fas fa-list me-2 text-primary"></i>Service Request List</h5>
              <span className="badge bg-primary">{serviceRequests.length} requests</span>
            </Card.Header>
            <Card.Body>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Project</th>
                    <th>Customer</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Scheduled Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {serviceRequests.map((request) => (
                    <tr key={request._id}>
                      <td>{request._id.substring(request._id.length - 6)}</td>
                      <td>{request.title}</td>
                      <td>
                        {request.project?.contractNumber ? (
                          <span>{request.project.contractNumber}</span>
                        ) : (
                          <span className="text-muted">Standalone</span>
                        )}
                      </td>
                      <td>
                        {request.customer?.name ? (
                          <span>{request.customer.name}</span>
                        ) : (
                          <span className="text-muted">Unknown</span>
                        )}
                      </td>
                      <td>
                        {formatRequestType(request.requestType)}
                        {request.warrantyRelated && (
                          <Badge bg="info" className="ms-1">
                            Warranty
                          </Badge>
                        )}
                      </td>
                      <td>
                        <Badge bg={getStatusBadgeVariant(request.status)}>
                          {request.status.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td>
                        <Badge bg={getPriorityBadgeVariant(request.priority)}>
                          {request.priority}
                        </Badge>
                      </td>
                      <td>{formatDate(request.scheduledDate)}</td>
                      <td>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => navigate(`/service-requests/${request._id}`)}
                        >
                          <i className="fas fa-eye me-1"></i> View
                        </Button>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => navigate(`/service-requests/${request._id}/edit`)}
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

          {/* Pagination */}
          {pages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                />

                {[...Array(pages).keys()].map((x) => (
                  <Pagination.Item
                    key={x + 1}
                    active={x + 1 === page}
                    onClick={() => handlePageChange(x + 1)}
                  >
                    {x + 1}
                  </Pagination.Item>
                ))}

                <Pagination.Next
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === pages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(pages)}
                  disabled={page === pages}
                />
              </Pagination>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ServiceRequestsPage;