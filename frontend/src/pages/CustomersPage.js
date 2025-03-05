import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Card, Table, Form, InputGroup, Badge, Pagination } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Loader from '../components/Loader';
import Message from '../components/Message';

const CustomersPage = () => {
  const navigate = useNavigate();
  
  // Get user info from Redux store
  const { userInfo } = useSelector((state) => state.auth);
  
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerTypeFilter, setCustomerTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Check authentication
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [navigate, userInfo]);
  
  // Load customer data
  useEffect(() => {
    // This would be replaced with an API call in a real implementation
    setIsLoading(true);
    
    // Check if we have customers in localStorage
    const storedCustomers = localStorage.getItem('customers');
    
    // Simulate API call with mock data
    setTimeout(() => {
      // Default mock customers
      const mockCustomers = [
        {
          _id: '1',
          name: 'Rajan Sharma',
          email: 'rajan.sharma@example.com',
          phone: '+91 9876543210',
          address: '123 Willow St, Wayanad, Kerala',
          type: 'residential',
          status: 'active',
          createdAt: '2023-01-15',
          totalProjects: 1,
          lifetimeValue: 120000
        },
        {
          _id: '2',
          name: 'Green Valley Resort',
          email: 'management@greenvalley.com',
          phone: '+91 9876543211',
          address: 'Green Valley Road, Munnar, Kerala',
          type: 'commercial',
          status: 'active',
          createdAt: '2023-02-05',
          totalProjects: 1,
          lifetimeValue: 350000
        },
        {
          _id: '3',
          name: 'Govt. FHC Kakkodi',
          email: 'fhc.kakkodi@gov.in',
          phone: '+91 9876543212',
          address: 'Govt. FHC, Kakkodi, Kozhikode',
          type: 'government',
          status: 'active',
          createdAt: '2023-01-20',
          totalProjects: 2,
          lifetimeValue: 220000
        },
        {
          _id: '4',
          name: 'Janatha Home World',
          email: 'info@janathaworld.com',
          phone: '+91 9876543213',
          address: '45 Main Road, Perinthalmanna',
          type: 'commercial',
          status: 'active',
          createdAt: '2023-02-10',
          totalProjects: 1,
          lifetimeValue: 180000
        },
        {
          _id: '5',
          name: 'KM Rexine',
          email: 'office@kmrexine.com',
          phone: '+91 9876543214',
          address: 'Industrial Zone, Perinthalmanna',
          type: 'industrial',
          status: 'active',
          createdAt: '2023-01-25',
          totalProjects: 2,
          lifetimeValue: 450000
        }
      ];
      
      // If we have stored customers, use those instead
      const finalCustomers = storedCustomers ? JSON.parse(storedCustomers) : mockCustomers;
      
      // If there are no stored customers yet, initialize localStorage
      if (!storedCustomers) {
        localStorage.setItem('customers', JSON.stringify(mockCustomers));
      }
      
      setCustomers(finalCustomers);
      setFilteredCustomers(finalCustomers);
      setIsLoading(false);
    }, 500);
  }, []);
  
  // Apply filters
  useEffect(() => {
    let results = customers;
    
    // Apply customer type filter
    if (customerTypeFilter) {
      results = results.filter(customer => customer.type === customerTypeFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
      results = results.filter(customer => customer.status === statusFilter);
    }
    
    // Apply search filter
    if (searchTerm) {
      const searchTermLower = searchTerm.toLowerCase();
      results = results.filter(
        customer =>
          customer.name.toLowerCase().includes(searchTermLower) ||
          customer.email.toLowerCase().includes(searchTermLower) ||
          customer.phone.includes(searchTerm) ||
          customer.address.toLowerCase().includes(searchTermLower)
      );
    }
    
    setFilteredCustomers(results);
    setCurrentPage(1); // Reset to first page when filters change
  }, [customers, searchTerm, customerTypeFilter, statusFilter]);
  
  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  
  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };
  
  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setCustomerTypeFilter('');
    setStatusFilter('');
  };
  
  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get customer type badge
  const getCustomerTypeBadge = (type) => {
    switch (type) {
      case 'residential':
        return <Badge bg="info">Residential</Badge>;
      case 'commercial':
        return <Badge bg="success">Commercial</Badge>;
      case 'industrial':
        return <Badge bg="warning">Industrial</Badge>;
      case 'government':
        return <Badge bg="primary">Government</Badge>;
      default:
        return <Badge bg="secondary">{type}</Badge>;
    }
  };
  
  // Get customer status badge
  const getCustomerStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'inactive':
        return <Badge bg="secondary">Inactive</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="mb-0">
            <i className="fas fa-users me-3 text-primary"></i>Customers
          </h1>
          <p className="text-muted mt-2 mb-0">Manage your customer database</p>
        </Col>
        <Col className="text-end">
          <Link to="/customers/create">
            <Button size="lg" className="my-3">
              <i className="fas fa-plus me-2"></i> Add Customer
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
            <Col md={6} lg={4} className="mb-3">
              <InputGroup>
                <InputGroup.Text>
                  <i className="fas fa-search"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                )}
              </InputGroup>
            </Col>
            
            <Col md={6} lg={3} className="mb-3">
              <Form.Group controlId="customerTypeFilter">
                <Form.Select
                  value={customerTypeFilter}
                  onChange={(e) => setCustomerTypeFilter(e.target.value)}
                  aria-label="Customer type filter"
                >
                  <option value="">All Customer Types</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="industrial">Industrial</option>
                  <option value="government">Government</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6} lg={3} className="mb-3">
              <Form.Group controlId="statusFilter">
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Status filter"
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6} lg={2} className="mb-3 d-flex align-items-end">
              <Button 
                variant="outline-secondary" 
                className="w-100"
                onClick={resetFilters}
                disabled={!searchTerm && !customerTypeFilter && !statusFilter}
              >
                Reset Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {isLoading ? (
        <Loader />
      ) : filteredCustomers.length === 0 ? (
        <Message variant="info">
          No customers found
          {(searchTerm || customerTypeFilter || statusFilter) && " matching the selected filters"}
        </Message>
      ) : (
        <>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-list me-2 text-primary"></i>
                Customer List
              </h5>
              <Badge bg="primary" pill>
                {filteredCustomers.length} customers
              </Badge>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Contact Information</th>
                      <th>Type</th>
                      <th>Status</th>
                      <th className="text-center">Projects</th>
                      <th className="text-end">Lifetime Value</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((customer) => (
                      <tr key={customer._id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div 
                              className="rounded-circle bg-light d-flex align-items-center justify-content-center me-2" 
                              style={{ width: '40px', height: '40px' }}
                            >
                              <i className="fas fa-user text-primary"></i>
                            </div>
                            <div>
                              <div className="fw-semibold">{customer.name}</div>
                              <small className="text-muted">Since {new Date(customer.createdAt).toLocaleDateString()}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <i className="fas fa-envelope text-muted me-2"></i>
                            <a href={`mailto:${customer.email}`}>{customer.email}</a>
                          </div>
                          <div>
                            <i className="fas fa-phone text-muted me-2"></i>
                            <a href={`tel:${customer.phone}`}>{customer.phone}</a>
                          </div>
                        </td>
                        <td>{getCustomerTypeBadge(customer.type)}</td>
                        <td>{getCustomerStatusBadge(customer.status)}</td>
                        <td className="text-center">{customer.totalProjects}</td>
                        <td className="text-end">{formatCurrency(customer.lifetimeValue)}</td>
                        <td className="text-center">
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="me-2"
                            onClick={() => navigate(`/customers/${customer._id}`)}
                          >
                            <i className="fas fa-eye me-1"></i> View
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate(`/customers/${customer._id}/edit`)}
                          >
                            <i className="fas fa-edit me-1"></i> Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination>
                <Pagination.First
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                />
                <Pagination.Prev
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />

                {Array.from({ length: totalPages }, (_, i) => (
                  <Pagination.Item
                    key={i + 1}
                    active={i + 1 === currentPage}
                    onClick={() => handlePageChange(i + 1)}
                  >
                    {i + 1}
                  </Pagination.Item>
                ))}

                <Pagination.Next
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
                <Pagination.Last
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage === totalPages}
                />
              </Pagination>
            </div>
          )}
          
          {/* Customer Statistics Summary */}
          <Row className="mt-4">
            <Col md={4}>
              <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-primary bg-opacity-10 p-3 me-3">
                      <i className="fas fa-users fa-lg text-primary"></i>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Total Customers</h6>
                      <h3 className="mb-0">{customers.length}</h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-success bg-opacity-10 p-3 me-3">
                      <i className="fas fa-solar-panel fa-lg text-success"></i>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Total Projects</h6>
                      <h3 className="mb-0">
                        {customers.reduce((sum, customer) => sum + customer.totalProjects, 0)}
                      </h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm border-0 mb-4">
                <Card.Body className="p-3">
                  <div className="d-flex align-items-center">
                    <div className="rounded-circle bg-info bg-opacity-10 p-3 me-3">
                      <i className="fas fa-rupee-sign fa-lg text-info"></i>
                    </div>
                    <div>
                      <h6 className="text-muted mb-1">Total Revenue</h6>
                      <h3 className="mb-0">
                        {formatCurrency(customers.reduce((sum, customer) => sum + customer.lifetimeValue, 0))}
                      </h3>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </>
  );
};

export default CustomersPage;