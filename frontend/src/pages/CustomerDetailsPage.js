import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Alert, 
  Badge, 
  Tabs, 
  Tab, 
  Table, 
  ListGroup 
} from 'react-bootstrap';

const CustomerDetailsPage = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';
  
  // Get current user information
  const { userInfo } = useSelector((state) => state.auth);
  
  // States
  const [isLoading, setIsLoading] = useState(false);
  const [customerData, setCustomerData] = useState(null);
  const [customerHistory, setCustomerHistory] = useState({
    leads: [],
    proposals: [],
    projects: [],
    serviceRequests: []
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    type: 'residential',
    status: 'active',
    contactPerson: '',
    alternatePhone: '',
    gstNumber: '',
    notes: ''
  });
  const [validated, setValidated] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Check authentication
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [navigate, userInfo]);
  
  // Load customer data if in edit or view mode
  useEffect(() => {
    if (!isCreateMode && id) {
      setIsLoading(true);
      
      // This would be replaced with an API call in a real implementation
      // Simulating API call with mock data
      setTimeout(() => {
        // Dummy customer data map to match IDs
        const customerDataMap = {
          // Customer 1 - Rajan Sharma
          '1': {
            _id: '1',
            name: 'Rajan Sharma',
            email: 'rajan.sharma@example.com',
            phone: '+91 9876543210',
            address: '123 Willow St, Wayanad, Kerala',
            type: 'residential',
            status: 'active',
            createdAt: '2023-01-15',
            contactPerson: '',
            alternatePhone: '+91 9876543220',
            gstNumber: '',
            notes: 'Residential customer interested in off-grid solar solutions.',
            totalProjects: 1,
            lifetimeValue: 120000
          },
          // Customer 2 - Green Valley Resort
          '2': {
            _id: '2',
            name: 'Green Valley Resort',
            email: 'management@greenvalley.com',
            phone: '+91 9876543211',
            address: 'Green Valley Road, Munnar, Kerala',
            type: 'commercial',
            status: 'active',
            createdAt: '2023-02-05',
            contactPerson: 'Arun Kumar',
            alternatePhone: '+91 9876543299',
            gstNumber: 'GSTIN12345678XY',
            notes: 'Large resort with multiple buildings. Interested in comprehensive solar solution.',
            totalProjects: 1,
            lifetimeValue: 350000
          },
          // Customer 3 - Govt FHC
          '3': {
            _id: '3',
            name: 'Govt. FHC Kakkodi',
            email: 'fhc.kakkodi@gov.in',
            phone: '+91 9876543212',
            address: 'Govt. FHC, Kakkodi, Kozhikode',
            type: 'government',
            status: 'active',
            createdAt: '2023-01-20',
            contactPerson: 'Dr. Sanjay Menon',
            alternatePhone: '+91 9876543213',
            gstNumber: 'GOVTFHC123456',
            notes: 'Government facility requiring uninterrupted power for critical medical equipment.',
            totalProjects: 2,
            lifetimeValue: 220000
          },
          // Default - use if ID isn't found
          'default': {
            _id: id,
            name: 'Sample Customer',
            email: 'sample@example.com',
            phone: '+91 9876543214',
            address: 'Sample Address',
            type: 'residential',
            status: 'active',
            createdAt: '2023-01-01',
            contactPerson: '',
            alternatePhone: '',
            gstNumber: '',
            notes: 'Sample customer for testing.',
            totalProjects: 0,
            lifetimeValue: 0
          }
        };
        
        // Get the customer data based on ID, or use default if not found
        const customerData = customerDataMap[id] || customerDataMap['default'];
        
        // Set customer data
        setCustomerData(customerData);
        
        // Set form data for edit mode
        if (isEditMode) {
          setFormData({
            name: customerData.name,
            email: customerData.email,
            phone: customerData.phone,
            address: customerData.address,
            type: customerData.type,
            status: customerData.status,
            contactPerson: customerData.contactPerson || '',
            alternatePhone: customerData.alternatePhone || '',
            gstNumber: customerData.gstNumber || '',
            notes: customerData.notes || ''
          });
        }
        
        // Load customer history (mock data)
        const history = {
          leads: [
            {
              _id: 'lead1',
              title: 'Initial Inquiry for Solar Installation',
              source: 'Website',
              status: 'converted',
              createdAt: '2023-01-25',
              assignedTo: 'Ramesh'
            }
          ],
          proposals: [
            {
              _id: 'prop1',
              title: 'Hybrid System for Main Building',
              status: 'accepted',
              createdAt: '2023-01-30',
              amount: 350000
            }
          ],
          projects: [
            {
              _id: 'proj1',
              name: '15KW Hybrid System',
              contractNumber: 'PRJ2023-005',
              status: 'planning',
              progress: 10,
              startDate: '2023-03-25',
              targetCompletionDate: '2023-05-30'
            }
          ],
          serviceRequests: [
            {
              _id: 'serv1',
              title: 'Annual Maintenance',
              status: 'scheduled',
              requestType: 'maintenance',
              priority: 'medium',
              createdAt: '2023-03-10',
              scheduledDate: '2023-06-15'
            }
          ]
        };
        
        setCustomerHistory(history);
        setIsLoading(false);
      }, 1000);
    }
  }, [isCreateMode, isEditMode, id]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Reset status messages
    setSubmitError('');
    setSubmitSuccess(false);
    
    // Handle checkbox type
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: fieldValue,
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Reset status messages
    setSubmitError('');
    setSubmitSuccess(false);
    
    // Form validation
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Create a copy of the form data
    const customerData = { ...formData };
    
    console.log('Submitting customer data:', customerData);
    
    // Add new customer to localStorage in create mode
    if (isCreateMode) {
      // Get existing customers
      const existingCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
      
      // Create a new customer with additional fields
      const newCustomer = {
        ...customerData,
        _id: `new-${Date.now()}`, // Generate a unique ID
        createdAt: new Date().toISOString(),
        totalProjects: 0,
        lifetimeValue: 0
      };
      
      // Add to the list
      existingCustomers.push(newCustomer);
      
      // Save back to localStorage
      localStorage.setItem('customers', JSON.stringify(existingCustomers));
    }
    
    // Update customer in localStorage in edit mode
    if (isEditMode && id) {
      // Get existing customers
      const existingCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
      
      // Find the customer to update
      const updatedCustomers = existingCustomers.map(customer => {
        if (customer._id === id) {
          return { 
            ...customer, 
            ...customerData,
            // Keep these fields unchanged
            _id: customer._id,
            createdAt: customer.createdAt,
            totalProjects: customer.totalProjects,
            lifetimeValue: customer.lifetimeValue
          };
        }
        return customer;
      });
      
      // Save back to localStorage
      localStorage.setItem('customers', JSON.stringify(updatedCustomers));
    }
    
    // Simulate API call
    setTimeout(() => {
      setSubmitSuccess(true);
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/customers');
      }, 1500);
    }, 500);
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
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
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge bg="success">Active</Badge>;
      case 'inactive':
        return <Badge bg="secondary">Inactive</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  // Get lead status badge
  const getLeadStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <Badge bg="info">New</Badge>;
      case 'contacted':
        return <Badge bg="primary">Contacted</Badge>;
      case 'qualified':
        return <Badge bg="warning">Qualified</Badge>;
      case 'proposal':
        return <Badge bg="secondary">Proposal</Badge>;
      case 'converted':
        return <Badge bg="success">Converted</Badge>;
      case 'lost':
        return <Badge bg="danger">Lost</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  // Get proposal status badge
  const getProposalStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return <Badge bg="secondary">Draft</Badge>;
      case 'sent':
        return <Badge bg="info">Sent</Badge>;
      case 'accepted':
        return <Badge bg="success">Accepted</Badge>;
      case 'rejected':
        return <Badge bg="danger">Rejected</Badge>;
      case 'expired':
        return <Badge bg="warning">Expired</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  // Get project status badge
  const getProjectStatusBadge = (status) => {
    switch (status) {
      case 'planning':
        return <Badge bg="info">Planning</Badge>;
      case 'installation':
        return <Badge bg="primary">Installation</Badge>;
      case 'testing':
        return <Badge bg="warning">Testing</Badge>;
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  // Get service request status badge
  const getServiceStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <Badge bg="info">New</Badge>;
      case 'assigned':
        return <Badge bg="primary">Assigned</Badge>;
      case 'scheduled':
        return <Badge bg="warning">Scheduled</Badge>;
      case 'in_progress':
        return <Badge bg="primary">In Progress</Badge>;
      case 'on_hold':
        return <Badge bg="secondary">On Hold</Badge>;
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };
  
  // Create or Edit mode form
  if (isCreateMode || isEditMode) {
    return (
      <>
        <Link to="/customers" className="btn btn-light my-3">
          Go Back
        </Link>
        
        <h1 className="mb-4">
          <i className="fas fa-user me-3 text-primary"></i>
          {isCreateMode ? 'Add New Customer' : 'Edit Customer'}
        </h1>
        
        {submitError && (
          <Alert variant="danger">
            <Alert.Heading>Error</Alert.Heading>
            <p>{submitError}</p>
          </Alert>
        )}
        
        {submitSuccess && (
          <Alert variant="success">
            <Alert.Heading>
              {isCreateMode ? 'Customer Created!' : 'Customer Updated!'}
            </Alert.Heading>
            <p>
              {isCreateMode 
                ? 'The customer has been successfully added.' 
                : 'The customer information has been successfully updated.'}
            </p>
          </Alert>
        )}
        
        <Card className="shadow-sm border-0">
          <Card.Body>
            <Form noValidate validated={validated} onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group controlId="name" className="mb-3">
                    <Form.Label>Customer Name</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter customer name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a customer name.
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group controlId="email" className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email address"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a valid email address.
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group controlId="phone" className="mb-3">
                    <Form.Label>Phone Number</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter phone number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide a phone number.
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group controlId="alternatePhone" className="mb-3">
                    <Form.Label>Alternate Phone (Optional)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter alternate phone number"
                      name="alternatePhone"
                      value={formData.alternatePhone}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  
                  <Form.Group controlId="address" className="mb-3">
                    <Form.Label>Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please provide an address.
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                
                <Col md={6}>
                  <Form.Group controlId="type" className="mb-3">
                    <Form.Label>Customer Type</Form.Label>
                    <Form.Select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      required
                    >
                      <option value="residential">Residential</option>
                      <option value="commercial">Commercial</option>
                      <option value="industrial">Industrial</option>
                      <option value="government">Government</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group controlId="status" className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group controlId="contactPerson" className="mb-3">
                    <Form.Label>Contact Person (Optional)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter contact person's name"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                    />
                    <Form.Text className="text-muted">
                      For businesses, government, and institutions
                    </Form.Text>
                  </Form.Group>
                  
                  <Form.Group controlId="gstNumber" className="mb-3">
                    <Form.Label>GST Number (Optional)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter GST number"
                      name="gstNumber"
                      value={formData.gstNumber}
                      onChange={handleChange}
                    />
                  </Form.Group>
                  
                  <Form.Group controlId="notes" className="mb-3">
                    <Form.Label>Notes (Optional)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Enter any additional notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-end mt-3">
                <Button
                  variant="outline-secondary"
                  className="me-2"
                  onClick={() => navigate('/customers')}
                >
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {isCreateMode ? 'Add Customer' : 'Update Customer'}
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </>
    );
  }
  
  // View mode - customer details
  return (
    <>
      <Link to="/customers" className="btn btn-light my-3">
        Go Back
      </Link>
      
      {isLoading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading customer information...</p>
        </div>
      ) : customerData ? (
        <>
          <Row className="mb-4 align-items-center">
            <Col>
              <h1 className="mb-0">
                <i className="fas fa-user me-3 text-primary"></i>
                {customerData.name}
              </h1>
              <p className="text-muted mt-2 mb-0">
                Customer since {formatDate(customerData.createdAt)} • 
                {getCustomerTypeBadge(customerData.type)}
              </p>
            </Col>
            <Col xs="auto">
              <Button 
                variant="primary" 
                className="me-2"
                onClick={() => navigate(`/customers/${customerData._id}/edit`)}
              >
                <i className="fas fa-edit me-2"></i> Edit
              </Button>
              <Button 
                variant="outline-primary"
                onClick={() => navigate('/leads/create', { state: { customerId: customerData._id } })}
              >
                <i className="fas fa-plus me-2"></i> Create Lead
              </Button>
            </Col>
          </Row>
          
          <Tabs defaultActiveKey="overview" id="customer-tabs" className="mb-4">
            <Tab eventKey="overview" title="Overview">
              <Row>
                <Col lg={4}>
                  <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white py-3 border-bottom">
                      <h5 className="mb-0">
                        <i className="fas fa-info-circle me-2 text-primary"></i>
                        Customer Information
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="px-0 py-2 border-bottom">
                          <Row>
                            <Col xs={4} className="text-muted">Status</Col>
                            <Col xs={8} className="text-end">
                              {getStatusBadge(customerData.status)}
                            </Col>
                          </Row>
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0 py-2 border-bottom">
                          <Row>
                            <Col xs={4} className="text-muted">Type</Col>
                            <Col xs={8} className="text-end">
                              {getCustomerTypeBadge(customerData.type)}
                            </Col>
                          </Row>
                        </ListGroup.Item>
                        {customerData.contactPerson && (
                          <ListGroup.Item className="px-0 py-2 border-bottom">
                            <Row>
                              <Col xs={4} className="text-muted">Contact Person</Col>
                              <Col xs={8} className="text-end">
                                {customerData.contactPerson}
                              </Col>
                            </Row>
                          </ListGroup.Item>
                        )}
                        {customerData.gstNumber && (
                          <ListGroup.Item className="px-0 py-2 border-bottom">
                            <Row>
                              <Col xs={4} className="text-muted">GST Number</Col>
                              <Col xs={8} className="text-end">
                                {customerData.gstNumber}
                              </Col>
                            </Row>
                          </ListGroup.Item>
                        )}
                        <ListGroup.Item className="px-0 py-2 border-bottom">
                          <Row>
                            <Col xs={4} className="text-muted">Projects</Col>
                            <Col xs={8} className="text-end">
                              <Badge bg="primary" pill>{customerData.totalProjects}</Badge>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0 py-2 border-bottom">
                          <Row>
                            <Col xs={4} className="text-muted">Lifetime Value</Col>
                            <Col xs={8} className="text-end fw-bold">
                              {formatCurrency(customerData.lifetimeValue)}
                            </Col>
                          </Row>
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0 py-2 border-bottom">
                          <Row>
                            <Col xs={4} className="text-muted">Customer Since</Col>
                            <Col xs={8} className="text-end">
                              {formatDate(customerData.createdAt)}
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>

                  <Card className="shadow-sm border-0 mb-4">
                    <Card.Header className="bg-white py-3 border-bottom">
                      <h5 className="mb-0">
                        <i className="fas fa-phone-alt me-2 text-primary"></i>
                        Contact Information
                      </h5>
                    </Card.Header>
                    <Card.Body>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="px-0 py-2 border-bottom">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-envelope text-muted me-3"></i>
                            <div>
                              <div className="text-muted small">Email</div>
                              <a href={`mailto:${customerData.email}`}>{customerData.email}</a>
                            </div>
                          </div>
                        </ListGroup.Item>
                        <ListGroup.Item className="px-0 py-2 border-bottom">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-phone text-muted me-3"></i>
                            <div>
                              <div className="text-muted small">Phone</div>
                              <a href={`tel:${customerData.phone}`}>{customerData.phone}</a>
                            </div>
                          </div>
                        </ListGroup.Item>
                        {customerData.alternatePhone && (
                          <ListGroup.Item className="px-0 py-2 border-bottom">
                            <div className="d-flex align-items-center">
                              <i className="fas fa-phone-alt text-muted me-3"></i>
                              <div>
                                <div className="text-muted small">Alternate Phone</div>
                                <a href={`tel:${customerData.alternatePhone}`}>{customerData.alternatePhone}</a>
                              </div>
                            </div>
                          </ListGroup.Item>
                        )}
                        <ListGroup.Item className="px-0 py-2">
                          <div className="d-flex align-items-start">
                            <i className="fas fa-map-marker-alt text-muted me-3 mt-1"></i>
                            <div>
                              <div className="text-muted small">Address</div>
                              <div>{customerData.address}</div>
                            </div>
                          </div>
                        </ListGroup.Item>
                      </ListGroup>
                    </Card.Body>
                  </Card>
                </Col>
                
                <Col lg={8}>
                  {customerData.notes && (
                    <Card className="shadow-sm border-0 mb-4">
                      <Card.Header className="bg-white py-3 border-bottom">
                        <h5 className="mb-0">
                          <i className="fas fa-sticky-note me-2 text-primary"></i>
                          Notes
                        </h5>
                      </Card.Header>
                      <Card.Body>
                        <p className="mb-0">{customerData.notes}</p>
                      </Card.Body>
                    </Card>
                  )}
                  
                  {/* Quick Stats */}
                  <Row className="mb-4">
                    <Col sm={6} lg={3}>
                      <Card className="shadow-sm border-0 mb-3 mb-lg-0">
                        <Card.Body className="p-3">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-primary bg-opacity-10 p-2 me-3">
                              <i className="fas fa-user-plus text-primary"></i>
                            </div>
                            <div>
                              <h6 className="text-muted mb-0 small">Leads</h6>
                              <h4 className="mb-0">{customerHistory.leads.length}</h4>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6} lg={3}>
                      <Card className="shadow-sm border-0 mb-3 mb-lg-0">
                        <Card.Body className="p-3">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-info bg-opacity-10 p-2 me-3">
                              <i className="fas fa-file-contract text-info"></i>
                            </div>
                            <div>
                              <h6 className="text-muted mb-0 small">Proposals</h6>
                              <h4 className="mb-0">{customerHistory.proposals.length}</h4>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6} lg={3}>
                      <Card className="shadow-sm border-0 mb-3 mb-sm-0">
                        <Card.Body className="p-3">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-success bg-opacity-10 p-2 me-3">
                              <i className="fas fa-solar-panel text-success"></i>
                            </div>
                            <div>
                              <h6 className="text-muted mb-0 small">Projects</h6>
                              <h4 className="mb-0">{customerHistory.projects.length}</h4>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                    <Col sm={6} lg={3}>
                      <Card className="shadow-sm border-0">
                        <Card.Body className="p-3">
                          <div className="d-flex align-items-center">
                            <div className="rounded-circle bg-warning bg-opacity-10 p-2 me-3">
                              <i className="fas fa-tools text-warning"></i>
                            </div>
                            <div>
                              <h6 className="text-muted mb-0 small">Service Requests</h6>
                              <h4 className="mb-0">{customerHistory.serviceRequests.length}</h4>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  </Row>
                  
                  {/* Recent Activity */}
                  <Card className="shadow-sm border-0">
                    <Card.Header className="bg-white py-3 border-bottom">
                      <h5 className="mb-0">
                        <i className="fas fa-history me-2 text-primary"></i>
                        Recent Activity
                      </h5>
                    </Card.Header>
                    <Card.Body className="p-0">
                      <div className="timeline p-3">
                        {/* Merge and sort all activities */}
                        {[
                          ...customerHistory.serviceRequests.map(item => ({
                            ...item,
                            type: 'service',
                            date: item.createdAt,
                            title: `Service Request: ${item.title}`
                          })),
                          ...customerHistory.projects.map(item => ({
                            ...item,
                            type: 'project',
                            date: item.startDate,
                            title: `Project: ${item.name}`
                          })),
                          ...customerHistory.proposals.map(item => ({
                            ...item,
                            type: 'proposal',
                            date: item.createdAt,
                            title: `Proposal: ${item.title}`
                          })),
                          ...customerHistory.leads.map(item => ({
                            ...item,
                            type: 'lead',
                            date: item.createdAt,
                            title: `Lead: ${item.title}`
                          }))
                        ]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .slice(0, 6)
                        .map((item, index) => (
                          <div key={index} className="timeline-item pb-3 mb-3 border-bottom">
                            <div className="d-flex">
                              <div>
                                {item.type === 'lead' && (
                                  <div className="timeline-icon bg-primary">
                                    <i className="fas fa-user-plus text-white"></i>
                                  </div>
                                )}
                                {item.type === 'proposal' && (
                                  <div className="timeline-icon bg-info">
                                    <i className="fas fa-file-contract text-white"></i>
                                  </div>
                                )}
                                {item.type === 'project' && (
                                  <div className="timeline-icon bg-success">
                                    <i className="fas fa-solar-panel text-white"></i>
                                  </div>
                                )}
                                {item.type === 'service' && (
                                  <div className="timeline-icon bg-warning">
                                    <i className="fas fa-tools text-white"></i>
                                  </div>
                                )}
                              </div>
                              <div className="ms-3 flex-grow-1">
                                <div className="d-flex justify-content-between">
                                  <h6 className="mb-1">{item.title}</h6>
                                  <span className="text-muted small">{formatDate(item.date)}</span>
                                </div>
                                <div>
                                  {item.type === 'lead' && getLeadStatusBadge(item.status)}
                                  {item.type === 'proposal' && getProposalStatusBadge(item.status)}
                                  {item.type === 'project' && getProjectStatusBadge(item.status)}
                                  {item.type === 'service' && getServiceStatusBadge(item.status)}
                                  
                                  {item.type === 'project' && (
                                    <span className="ms-2 text-muted small">
                                      Contract: {item.contractNumber}
                                    </span>
                                  )}
                                  {item.type === 'proposal' && item.amount && (
                                    <span className="ms-2 text-muted small">
                                      Amount: {formatCurrency(item.amount)}
                                    </span>
                                  )}
                                  {item.type === 'lead' && item.source && (
                                    <span className="ms-2 text-muted small">
                                      Source: {item.source}
                                    </span>
                                  )}
                                </div>
                                <div className="mt-2">
                                  <Button 
                                    variant="outline-primary" 
                                    size="sm"
                                    onClick={() => navigate(`/${item.type}s/${item._id}`)}
                                  >
                                    View Details
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {(customerHistory.leads.length === 0 &&
                          customerHistory.proposals.length === 0 &&
                          customerHistory.projects.length === 0 &&
                          customerHistory.serviceRequests.length === 0) && (
                          <p className="text-muted text-center py-4">No activity found for this customer</p>
                        )}
                      </div>
                    </Card.Body>
                    <Card.Footer className="bg-white py-2 text-center">
                      <Button variant="link" className="text-decoration-none">
                        View All Activity
                      </Button>
                    </Card.Footer>
                  </Card>
                </Col>
              </Row>
            </Tab>
            
            <Tab eventKey="leads" title="Leads">
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
                  <h5 className="mb-0">
                    <i className="fas fa-user-plus me-2 text-primary"></i>
                    Leads
                  </h5>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => navigate('/leads/create', { state: { customerId: customerData._id } })}
                  >
                    <i className="fas fa-plus me-1"></i> Add Lead
                  </Button>
                </Card.Header>
                <Card.Body className="p-0">
                  {customerHistory.leads.length > 0 ? (
                    <Table hover responsive className="mb-0">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Source</th>
                          <th>Status</th>
                          <th>Created Date</th>
                          <th>Assigned To</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerHistory.leads.map((lead) => (
                          <tr key={lead._id}>
                            <td>{lead.title}</td>
                            <td>{lead.source}</td>
                            <td>{getLeadStatusBadge(lead.status)}</td>
                            <td>{formatDate(lead.createdAt)}</td>
                            <td>{lead.assignedTo || 'Unassigned'}</td>
                            <td className="text-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate(`/leads/${lead._id}`)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted mb-3">No leads found for this customer</p>
                      <Button 
                        variant="primary" 
                        onClick={() => navigate('/leads/create', { state: { customerId: customerData._id } })}
                      >
                        <i className="fas fa-plus me-2"></i> Create New Lead
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="proposals" title="Proposals">
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
                  <h5 className="mb-0">
                    <i className="fas fa-file-contract me-2 text-primary"></i>
                    Proposals
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {customerHistory.proposals.length > 0 ? (
                    <Table hover responsive className="mb-0">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Created Date</th>
                          <th className="text-end">Amount</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerHistory.proposals.map((proposal) => (
                          <tr key={proposal._id}>
                            <td>{proposal.title}</td>
                            <td>{getProposalStatusBadge(proposal.status)}</td>
                            <td>{formatDate(proposal.createdAt)}</td>
                            <td className="text-end">{formatCurrency(proposal.amount)}</td>
                            <td className="text-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate(`/proposals/${proposal._id}`)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">No proposals found for this customer</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="projects" title="Projects">
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
                  <h5 className="mb-0">
                    <i className="fas fa-solar-panel me-2 text-primary"></i>
                    Projects
                  </h5>
                </Card.Header>
                <Card.Body className="p-0">
                  {customerHistory.projects.length > 0 ? (
                    <Table hover responsive className="mb-0">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Contract #</th>
                          <th>Status</th>
                          <th>Progress</th>
                          <th>Timeline</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerHistory.projects.map((project) => (
                          <tr key={project._id}>
                            <td>{project.name}</td>
                            <td>{project.contractNumber}</td>
                            <td>{getProjectStatusBadge(project.status)}</td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="progress flex-grow-1 me-2" style={{ height: '5px' }}>
                                  <div 
                                    className={`progress-bar bg-${project.progress === 100 ? 'success' : 'primary'}`}
                                    role="progressbar" 
                                    style={{ width: `${project.progress}%` }}
                                    aria-valuenow={project.progress}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                  ></div>
                                </div>
                                <span className="text-muted small">{project.progress}%</span>
                              </div>
                            </td>
                            <td>
                              <small className="d-block text-muted">Start: {formatDate(project.startDate)}</small>
                              <small className="d-block text-muted">Target: {formatDate(project.targetCompletionDate)}</small>
                            </td>
                            <td className="text-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate(`/projects/${project._id}`)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted">No projects found for this customer</p>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="service-requests" title="Service Requests">
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
                  <h5 className="mb-0">
                    <i className="fas fa-tools me-2 text-primary"></i>
                    Service Requests
                  </h5>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => navigate('/service-requests/create', { state: { customerId: customerData._id } })}
                  >
                    <i className="fas fa-plus me-1"></i> Add Service Request
                  </Button>
                </Card.Header>
                <Card.Body className="p-0">
                  {customerHistory.serviceRequests.length > 0 ? (
                    <Table hover responsive className="mb-0">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Type</th>
                          <th>Status</th>
                          <th>Priority</th>
                          <th>Created Date</th>
                          <th>Scheduled Date</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerHistory.serviceRequests.map((request) => (
                          <tr key={request._id}>
                            <td>{request.title}</td>
                            <td>{request.requestType.replace('_', ' ')}</td>
                            <td>{getServiceStatusBadge(request.status)}</td>
                            <td>
                              <Badge bg={
                                request.priority === 'high' ? 'danger' :
                                request.priority === 'medium' ? 'warning' :
                                'success'
                              }>
                                {request.priority}
                              </Badge>
                            </td>
                            <td>{formatDate(request.createdAt)}</td>
                            <td>{formatDate(request.scheduledDate)}</td>
                            <td className="text-center">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => navigate(`/service-requests/${request._id}`)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted mb-3">No service requests found for this customer</p>
                      <Button 
                        variant="primary" 
                        onClick={() => navigate('/service-requests/create', { state: { customerId: customerData._id } })}
                      >
                        <i className="fas fa-plus me-2"></i> Create New Service Request
                      </Button>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Tab>
            
            <Tab eventKey="communication" title="Communication Log">
              <Card className="shadow-sm border-0">
                <Card.Header className="bg-white d-flex justify-content-between align-items-center py-3 border-bottom">
                  <h5 className="mb-0">
                    <i className="fas fa-comments me-2 text-primary"></i>
                    Communication Log
                  </h5>
                  <Button variant="primary" size="sm">
                    <i className="fas fa-plus me-1"></i> Add Communication
                  </Button>
                </Card.Header>
                <Card.Body>
                  <div className="text-center py-4">
                    <p className="text-muted mb-3">No communication logs yet</p>
                    <Button variant="primary">
                      <i className="fas fa-plus me-2"></i> Add New Communication
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Tab>
          </Tabs>
        </>
      ) : (
        <Alert variant="warning">
          <Alert.Heading>Customer Not Found</Alert.Heading>
          <p>The requested customer information could not be found.</p>
          <Button 
            variant="outline-primary" 
            onClick={() => navigate('/customers')}
          >
            Return to Customer List
          </Button>
        </Alert>
      )}
    </>
  );
};

export default CustomerDetailsPage;