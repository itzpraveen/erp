import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Button, Card } from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import DataTable from '../components/common/DataTable';
import { getServiceRequests } from '../features/serviceRequests/serviceRequestSlice';
// Removed unused import resetServiceRequests
import { formatDate } from '../utils/formatters';

const ServiceRequestsPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  // Removed unused state variable location
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const { serviceRequests, isLoading, isError, message } = useSelector(
    (state) => state.serviceRequests
  );

  // Load service requests when component mounts or filters change
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      dispatch(getServiceRequests({ 
        status: statusFilter,
        priority: priorityFilter 
      }));
    }
  }, [dispatch, navigate, userInfo, statusFilter, priorityFilter]);

  // Get status badge variant
  const getStatusBadge = (status) => {
    const badgeClass = 
      status === 'new' ? 'bg-info' :
      status === 'scheduled' ? 'bg-primary' :
      status === 'in_progress' ? 'bg-warning' :
      status === 'on_hold' ? 'bg-secondary' :
      status === 'completed' ? 'bg-success' :
      'bg-danger';
    
    return `<span class="badge ${badgeClass}">${formatStatus(status)}</span>`;
  };

  // Get priority badge variant
  const getPriorityBadge = (priority) => {
    const badgeClass = 
      priority === 'low' ? 'bg-success' :
      priority === 'medium' ? 'bg-info' :
      priority === 'high' ? 'bg-warning' :
      'bg-danger';
    
    return `<span class="badge ${badgeClass}">${priority}</span>`;
  };

  // Format status text
  const formatStatus = (status) => {
    return status
      .replace('_', ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  // Table columns configuration
  const columns = [
    { 
      field: 'title', 
      header: 'Title',
      formatter: (value, row) => `<a href="/service-requests/${row._id}">${value}</a>`
    },
    {
      field: 'requestType',
      header: 'Type',
      formatter: (value) => value.charAt(0).toUpperCase() + value.slice(1)
    },
    { 
      field: 'status', 
      header: 'Status',
      formatter: (value) => getStatusBadge(value)
    },
    {
      field: 'priority',
      header: 'Priority',
      formatter: (value) => getPriorityBadge(value)
    },
    {
      field: 'customer',
      header: 'Customer',
      formatter: (value) => value?.name || 'N/A'
    },
    { 
      field: 'scheduledDate', 
      header: 'Scheduled',
      formatter: (value) => value ? formatDate(value) : 'Not Scheduled'
    },
    { 
      field: 'createdAt', 
      header: 'Created',
      formatter: (value) => formatDate(value)
    },
  ];

  // Table actions
  const actions = [
    {
      label: 'View',
      icon: 'fas fa-eye',
      variant: 'outline-primary',
      onClick: (row) => navigate(`/service-requests/${row._id}`)
    },
    {
      label: 'Edit',
      icon: 'fas fa-edit',
      variant: 'outline-secondary',
      onClick: (row) => navigate(`/service-requests/${row._id}/edit`)
    }
  ];

  return (
    <>
      <Row className="align-items-center">
        <Col>
          <h1>Service Requests</h1>
        </Col>
        <Col className="text-end">
          <Link to="/service-requests/create">
            <Button className="my-3">
              <i className="fas fa-plus"></i> Create Request
            </Button>
          </Link>
        </Col>
      </Row>

      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6} lg={4}>
              <div className="mb-3">
                <label htmlFor="statusFilter" className="form-label">Filter by Status</label>
                <select
                  id="statusFilter"
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="new">New</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </Col>
            <Col md={6} lg={4}>
              <div className="mb-3">
                <label htmlFor="priorityFilter" className="form-label">Filter by Priority</label>
                <select
                  id="priorityFilter"
                  className="form-select"
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                >
                  <option value="">All Priorities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{message}</Message>
      ) : serviceRequests.length === 0 ? (
        <Message>
          No service requests found. {statusFilter || priorityFilter ? 'Try changing filters or ' : ''}
          <Link to="/service-requests/create">create a new request</Link>.
        </Message>
      ) : (
        <DataTable
          columns={columns}
          data={serviceRequests}
          keyField="_id"
          actions={actions}
          sortable={true}
          filterable={true}
          pagination={true}
          onRowClick={(row) => navigate(`/service-requests/${row._id}`)}
        />
      )}
    </>
  );
};

export default ServiceRequestsPage;