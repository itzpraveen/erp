import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
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

const ProposalsPage = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showRefreshAlert, setShowRefreshAlert] = useState(false);
  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [customers, setCustomers] = useState([]);

  const itemsPerPage = 10;

  const location = useLocation();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);

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
      setIsLoading(true);
      
      // Load leads and customers for reference data
      const storedLeads = JSON.parse(localStorage.getItem('leads') || '[]');
      const storedCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
      setLeads(storedLeads);
      setCustomers(storedCustomers);
      console.log('Loaded customers for reference:', storedCustomers.length);
      
      // Load proposals from localStorage
      const storedProposals = JSON.parse(localStorage.getItem('proposals') || '[]');
      
      // Sort proposals by created date (newest first)
      const sortedProposals = storedProposals.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      // Initialize with some sample proposals if none exist
      if (sortedProposals.length === 0) {
        const sampleProposals = [
          {
            _id: 'proposal-1',
            title: 'Residential Solar Package',
            lead: 'lead-1',
            status: 'sent',
            systemDetails: {
              totalCapacity: 5.5,
              panelType: 'Jinko Solar 330W',
              panelCount: 15,
              estimatedProduction: 7500
            },
            financialDetails: {
              totalCost: 15000,
              netCost: 11000,
              incentives: [
                { name: 'Federal Tax Credit', amount: 4000 }
              ]
            },
            createdAt: '2023-03-10T10:30:00',
            createdBy: { name: 'Admin' },
            version: 1
          },
          {
            _id: 'proposal-2',
            title: 'Commercial Off-Grid System',
            lead: 'lead-2',
            status: 'accepted',
            systemDetails: {
              totalCapacity: 30,
              panelType: 'Canadian Solar 400W',
              panelCount: 75,
              estimatedProduction: 45000,
              batteryStorage: true,
              batteryCapacity: 50
            },
            financialDetails: {
              totalCost: 85000,
              netCost: 65000,
              incentives: [
                { name: 'Federal Tax Credit', amount: 15000 },
                { name: 'State Rebate', amount: 5000 }
              ]
            },
            createdAt: '2023-02-15T14:20:00',
            createdBy: { name: 'Admin' },
            version: 1
          }
        ];
        
        localStorage.setItem('proposals', JSON.stringify(sampleProposals));
        setProposals(sampleProposals);
      } else {
        setProposals(sortedProposals);
      }
      
      setIsLoading(false);
    }
  }, [navigate, userInfo, refreshKey]);

  // Effect to filter proposals based on status
  useEffect(() => {
    if (proposals.length > 0) {
      let filtered = [...proposals];
      
      // Apply status filter
      if (statusFilter) {
        filtered = filtered.filter(proposal => proposal.status === statusFilter);
      }
      
      // Paginate results
      setFilteredProposals(filtered);
    }
  }, [proposals, statusFilter]);

  // Effect to detect navigation back to this page from other routes
  useEffect(() => {
    // If we have location state with a refresh flag, refresh the data
    if (location.state?.refresh) {
      refreshData();
      // Clear the state to prevent repeated refreshes
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate, refreshData]);

  // Get the current page of proposals
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProposals = filteredProposals.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredProposals.length / itemsPerPage);

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

  // Get lead name by ID
  const getLeadName = (leadId) => {
    if (!leadId) return 'N/A';
    const lead = leads.find(l => String(l._id) === String(leadId));
    return lead ? lead.name : 'N/A';
  };
  
  // Get customer name by ID
  const getCustomerName = (customerId) => {
    if (!customerId) return 'N/A';
    const customer = customers.find(c => String(c._id) === String(customerId));
    return customer ? customer.name : 'N/A';
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
            <Col md={6} className="d-flex align-items-end">
              {statusFilter && (
                <Button
                  variant="outline-secondary"
                  onClick={() => setStatusFilter('')}
                >
                  Reset Filter
                </Button>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {isLoading ? (
        <Loader />
      ) : filteredProposals.length === 0 ? (
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
                {filteredProposals.length} proposals
              </Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <Table striped bordered hover responsive className="mb-0">
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
                  {currentProposals.map((proposal) => (
                    <tr key={proposal._id}>
                      <td>{proposal.title}</td>
                      <td>
                        {getLeadName(proposal.lead)}
                        {proposal.customerId && (
                          <div className="small text-muted">
                            Customer: {getCustomerName(proposal.customerId)}
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

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First
                  onClick={() => paginate(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                />

                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => paginate(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}

                <Pagination.Next
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => paginate(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
          
          {/* Proposal Statistics */}
          <Row className="mt-4">
            <Col md={6}>
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white py-3 border-bottom">
                  <h5 className="mb-0"><i className="fas fa-chart-pie me-2 text-primary"></i>Proposal Status Summary</h5>
                </Card.Header>
                <Card.Body>
                  {['draft', 'sent', 'negotiating', 'accepted', 'rejected'].map(status => {
                    const count = proposals.filter(p => p.status === status).length;
                    const percentage = Math.round((count / proposals.length) * 100) || 0;
                    let variant;
                    
                    switch(status) {
                      case 'draft': variant = 'secondary'; break;
                      case 'sent': variant = 'primary'; break;
                      case 'negotiating': variant = 'warning'; break;
                      case 'accepted': variant = 'success'; break;
                      case 'rejected': variant = 'danger'; break;
                      default: variant = 'secondary';
                    }
                    
                    return (
                      <div key={status} className="mb-3">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <div>
                            <Badge bg={variant} className="me-2">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                            <span>{count} proposals</span>
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
                            {proposals.length > 0 
                              ? (proposals.reduce((sum, proposal) => 
                                  sum + (proposal.systemDetails?.totalCapacity || 0), 0) / proposals.length).toFixed(1) + ' kW'
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
                            {proposals.length > 0 
                              ? formatCurrency(proposals.reduce((sum, proposal) => 
                                  sum + (proposal.financialDetails?.totalCost || 0), 0) / proposals.length)
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
                            {formatCurrency(proposals.reduce((sum, proposal) => 
                              sum + (proposal.financialDetails?.totalCost || 0), 0))}
                          </h4>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col md={6}>
                      <Card className="text-center">
                        <Card.Body>
                          <h6 className="text-muted mb-2">Acceptance Rate</h6>
                          <h4 className="mb-0">
                            {proposals.length > 0 
                              ? Math.round((proposals.filter(p => p.status === 'accepted').length / proposals.length) * 100) + '%'
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
        </>
      )}
    </>
  );
};

export default ProposalsPage;