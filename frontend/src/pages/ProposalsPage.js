import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Button,
  Alert,
  Badge,
  Card,
} from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import DataTable from '../components/common/DataTable';
import { getProposals, reset } from '../features/proposals/proposalSlice';
import { formatDate, formatStatus } from '../utils/formatters';

const ProposalsPage = () => {
  const [filterStatus, setFilterStatus] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const { proposals, isLoading, isError, message } = useSelector(
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

  // Load proposals when the component mounts or when filters change
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      dispatch(getProposals({ 
        status: filterStatus,
        _: new Date().getTime() // Cache busting
      }));
    }
  }, [dispatch, navigate, userInfo, filterStatus, refreshKey]);

  // Check for location state to refresh data (e.g., when coming back from the details page)
  useEffect(() => {
    if (location.state?.refresh) {
      refreshData();
      // Clear the state to prevent repeated refreshes
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, refreshData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  // Format status for display
  const getStatusBadge = (status) => {
    const badgeVariant = 
      status === 'draft' ? 'secondary' :
      status === 'sent' ? 'primary' :
      status === 'negotiating' ? 'warning' :
      status === 'accepted' ? 'success' :
      'danger';
    
    return (
      <Badge bg={badgeVariant}>
        {formatStatus(status)}
      </Badge>
    );
  };

  // Table columns configuration
  const columns = [
    { 
      field: 'title', 
      header: 'Title',
      formatter: (value, row) => (
        <Link to={`/proposals/${row._id}`}>
          {value}
        </Link>
      )
    },
    {
      field: 'lead',
      header: 'Lead',
      formatter: (value) => value?.name || 'N/A'
    },
    { 
      field: 'status', 
      header: 'Status',
      formatter: (value) => getStatusBadge(value)
    },
    {
      field: 'systemDetails.totalCapacity',
      header: 'Capacity',
      formatter: (value) => value ? `${value} kW` : 'N/A'
    },
    {
      field: 'financialDetails.totalCost',
      header: 'Value',
      formatter: (value, row) => {
        const currency = row.financialDetails?.currency || 'INR';
        const symbol = currency === 'INR' ? '₹' : 
                    currency === 'USD' ? '$' :
                    currency === 'EUR' ? '€' : '£';
        
        return value ? `${symbol}${parseInt(value).toLocaleString()}` : 'N/A';
      }
    },
    { 
      field: 'createdAt', 
      header: 'Created',
      formatter: (value) => formatDate(value)
    },
  ];

  // Define table actions
  const actions = [
    {
      label: 'View',
      icon: 'fas fa-eye',
      variant: 'outline-primary',
      onClick: (proposal) => navigate(`/proposals/${proposal._id}`)
    },
    {
      label: 'Edit',
      icon: 'fas fa-edit',
      variant: 'outline-secondary',
      onClick: (proposal) => navigate(`/proposals/${proposal._id}/edit`)
    }
  ];

  // Handle filter change
  const handleFilterChange = (event) => {
    setFilterStatus(event.target.value);
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

      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4}>
              <div className="mb-3 mb-md-0">
                <label htmlFor="statusFilter" className="form-label">Filter by Status</label>
                <select
                  id="statusFilter"
                  className="form-select"
                  value={filterStatus}
                  onChange={handleFilterChange}
                >
                  <option value="">All Proposals</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="negotiating">Negotiating</option>
                  <option value="accepted">Accepted</option>
                  <option value="rejected">Rejected</option>
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
      ) : proposals.length === 0 ? (
        <Message>
          No proposals found. {filterStatus && 'Try changing the filter or '}
          <Link to="/proposals/create">create a new proposal</Link>.
        </Message>
      ) : (
        <DataTable
          columns={columns}
          data={proposals}
          keyField="_id"
          actions={actions}
          sortable={true}
          filterable={true}
          pagination={true}
          onRowClick={(row) => navigate(`/proposals/${row._id}`)}
        />
      )}
    </>
  );
};

export default ProposalsPage;