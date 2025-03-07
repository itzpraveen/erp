import React, { useEffect, useState } from 'react';
import { getCustomers } from '../features/customers/customerSlice';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { formatAddress, formatDate, formatDateTime, formatStatus } from '../utils/formatters';
import {
  Row,
  Col,
  Card,
  Button,
  Form,
  Badge,
  ListGroup,
  Table,
  Alert,
  Tab,
  Nav,
  Modal
} from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ServiceRequestForm from '../components/ServiceRequestForm';
import {
  getServiceRequestById,
  resetServiceRequest,
  createServiceRequest,
  updateServiceRequest,
  updateServiceRequestStatus,
  addServiceRequestParts,
  addCustomerFeedback
} from '../features/serviceRequests/serviceRequestSlice';
import { getProjects } from '../features/projects/projectSlice';

const ServiceRequestDetailsPage = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';
  const projectId = location.state?.projectId;

  // Form state
  const [formData, setFormData] = useState({
    project: projectId || '',
    customer: '',
    requestType: 'maintenance',
    title: '',
    description: '',
    priority: 'medium',
    scheduledDate: '',
    estimatedHours: '',
    warrantyRelated: false,
  });

  // Form validation state
  const [validated, setValidated] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Status update modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: '',
  });

  // Parts modal state
  const [showPartsModal, setShowPartsModal] = useState(false);
  const [newPart, setNewPart] = useState({
    name: '',
    partNumber: '',
    quantity: 1,
    cost: 0,
  });

  // Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedback, setFeedback] = useState({
    rating: 5,
    comments: '',
  });

  // Notes state
  const [newNote, setNewNote] = useState('');

  // Redux state
  const { serviceRequest, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.serviceRequests
  );
  const { projects } = useSelector((state) => state.projects);
  const { customers } = useSelector((state) => state.customers);
  const { userInfo } = useSelector((state) => state.auth);

  // Load service request if in edit or view mode
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      // Load projects and customers for dropdowns - always fetch fresh data
      dispatch(getProjects());
      dispatch(getCustomers());
      
      if (!isCreateMode && id) {
        dispatch(getServiceRequestById(id));
      }
    }

    // Don't reset on cleanup to avoid flash
  }, [dispatch, navigate, userInfo, id, isCreateMode]);

  // Populate form with existing service request data when loaded
  useEffect(() => {
    if (serviceRequest && !isCreateMode) {
      // Format date for the form if it exists
      let scheduledDate = '';
      if (serviceRequest.scheduledDate) {
        const date = new Date(serviceRequest.scheduledDate);
        scheduledDate = date.toISOString().split('T')[0];
      }

      setFormData({
        project: serviceRequest.project?._id || '',
        customer: serviceRequest.customer?._id || '',
        requestType: serviceRequest.requestType || 'maintenance',
        title: serviceRequest.title || '',
        description: serviceRequest.description || '',
        priority: serviceRequest.priority || 'medium',
        scheduledDate,
        estimatedHours: serviceRequest.estimatedHours || '',
        warrantyRelated: serviceRequest.warrantyRelated || false,
      });
    }
  }, [serviceRequest, isCreateMode]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Reset status messages when form is changed
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
    setSubmitError('');
    setSubmitSuccess(false);
    
    // Form validation
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Additional validation
    if (!formData.customer) {
      setSubmitError('Please select a customer');
      setValidated(true);
      return;
    }
    
    // Create a copy of the form data
    const requestData = { ...formData };
    
    // Convert numeric values
    if (requestData.estimatedHours) {
      requestData.estimatedHours = parseFloat(requestData.estimatedHours);
    }
    
    if (isCreateMode) {
      dispatch(createServiceRequest(requestData))
        .unwrap()
        .then((result) => {
          setSubmitSuccess(true);
          // Redirect after a short delay to show success message
          setTimeout(() => {
            navigate(`/service-requests/${result._id}`, { state: { freshCreated: true } });
          }, 1000);
        })
        .catch(err => {
          console.error('Failed to create service request:', err);
          setSubmitError(err || 'Failed to create service request. Please try again.');
        });
    } else if (isEditMode) {
      dispatch(updateServiceRequest({ id, requestData }))
        .unwrap()
        .then(() => {
          setSubmitSuccess(true);
          // Redirect after a short delay to show success message
          setTimeout(() => {
            navigate(`/service-requests/${id}`);
          }, 1000);
        })
        .catch(err => {
          console.error('Failed to update service request:', err);
          setSubmitError(err || 'Failed to update service request. Please try again.');
        });
    }
  };

  // Handle status update
  const handleStatusUpdate = () => {
    dispatch(updateServiceRequestStatus({
      id,
      status: statusUpdate.status,
      notes: statusUpdate.notes,
    }))
      .unwrap()
      .then(() => {
        setShowStatusModal(false);
        setStatusUpdate({ status: '', notes: '' });
      })
      .catch(err => {
        console.error('Failed to update status:', err);
        alert('Failed to update status. Please try again.');
      });
  };

  // Handle adding a part
  const handleAddPart = () => {
    if (!newPart.name) {
      alert('Part name is required');
      return;
    }
    
    dispatch(addServiceRequestParts({
      id,
      parts: [{
        name: newPart.name,
        partNumber: newPart.partNumber,
        quantity: parseInt(newPart.quantity),
        cost: parseFloat(newPart.cost),
      }]
    }))
      .unwrap()
      .then(() => {
        setShowPartsModal(false);
        setNewPart({
          name: '',
          partNumber: '',
          quantity: 1,
          cost: 0,
        });
      })
      .catch(err => {
        console.error('Failed to add part:', err);
        alert('Failed to add part. Please try again.');
      });
  };

  // Handle adding customer feedback
  const handleAddFeedback = () => {
    dispatch(addCustomerFeedback({
      id,
      rating: parseInt(feedback.rating),
      comments: feedback.comments,
    }))
      .unwrap()
      .then(() => {
        setShowFeedbackModal(false);
        setFeedback({ rating: 5, comments: '' });
      })
      .catch(err => {
        console.error('Failed to add feedback:', err);
        alert('Failed to add feedback. Please try again.');
      });
  };

  // Format date is now coming from the utility functions
  // This keeps the function name the same but delegates to the utility
  const formatLocalDateTime = (dateString) => {
    return formatDateTime(dateString);
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

  // Create or Edit mode - render form
  if (isCreateMode || isEditMode) {
    return (
      <>
        <Link to="/service-requests" className="btn btn-light my-3">
          Go Back
        </Link>
        <h1>{isCreateMode ? 'Create New Service Request' : 'Edit Service Request'}</h1>
        
        {isLoading && <Loader />}
        {isError && <Message variant="danger">{message}</Message>}
        
        <Card>
          <Card.Body>
            <ServiceRequestForm 
              onSubmit={(requestData, setSuccess, setError) => {
                if (isCreateMode) {
                  dispatch(createServiceRequest(requestData))
                    .unwrap()
                    .then((result) => {
                      setSuccess(true);
                      // Redirect after a short delay to show success message
                      setTimeout(() => {
                        navigate(`/service-requests/${result._id}`, { state: { freshCreated: true } });
                      }, 1000);
                    })
                    .catch(err => {
                      console.error('Failed to create service request:', err);
                      setError(err || 'Failed to create service request. Please try again.');
                    });
                } else if (isEditMode) {
                  dispatch(updateServiceRequest({ id, requestData }))
                    .unwrap()
                    .then(() => {
                      setSuccess(true);
                      // Redirect after a short delay to show success message
                      setTimeout(() => {
                        navigate(`/service-requests/${id}`);
                      }, 1000);
                    })
                    .catch(err => {
                      console.error('Failed to update service request:', err);
                      setError(err || 'Failed to update service request. Please try again.');
                    });
                }
              }}
              initialData={serviceRequest || formData}
              mode={mode}
              projectId={projectId}
            />
          </Card.Body>
        </Card>
      </>
    );
  }

  // View mode - display service request details
  return (
    <>
      <Link to="/service-requests" className="btn btn-light my-3">
        Go Back
      </Link>
      
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{message}</Message>
      ) : serviceRequest ? (
        <>
          <Row className="align-items-center mb-3">
            <Col>
              <h1>Service Request: {serviceRequest.title}</h1>
            </Col>
            <Col className="text-end">
              <Badge bg={getStatusBadgeVariant(serviceRequest.status)} className="me-2 fs-6">
                {serviceRequest.status.replace('_', ' ')}
              </Badge>
              
              <Button
                variant="primary"
                className="me-2"
                onClick={() => navigate(`/service-requests/${serviceRequest._id}/edit`)}
              >
                <i className="fas fa-edit"></i> Edit
              </Button>
              
              <Button
                variant="success"
                onClick={() => {
                  setStatusUpdate({
                    status: serviceRequest.status,
                    notes: '',
                  });
                  setShowStatusModal(true);
                }}
              >
                <i className="fas fa-tasks"></i> Update Status
              </Button>
            </Col>
          </Row>

          <Tab.Container id="service-request-tabs" defaultActiveKey="details">
            <Row>
              <Col md={3}>
                <Card className="mb-3">
                  <Card.Header>Request Information</Card.Header>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>ID:</strong>{' '}
                      {serviceRequest._id}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Type:</strong>{' '}
                      {serviceRequest.requestType.replace('_', ' ')}
                      {serviceRequest.warrantyRelated && (
                        <Badge bg="info" className="ms-2">Warranty</Badge>
                      )}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Priority:</strong>{' '}
                      <Badge bg={getPriorityBadgeVariant(serviceRequest.priority)}>
                        {serviceRequest.priority}
                      </Badge>
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Created:</strong>{' '}
                      {formatLocalDateTime(serviceRequest.createdAt)}
                    </ListGroup.Item>
                    {serviceRequest.scheduledDate && (
                      <ListGroup.Item>
                        <strong>Scheduled:</strong>{' '}
                        {formatLocalDateTime(serviceRequest.scheduledDate)}
                      </ListGroup.Item>
                    )}
                    {serviceRequest.completionDate && (
                      <ListGroup.Item>
                        <strong>Completed:</strong>{' '}
                        {formatLocalDateTime(serviceRequest.completionDate)}
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card>

                <Nav variant="pills" className="flex-column mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="details">Details</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="customer">Customer Info</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notes">
                      Notes
                      {serviceRequest.notes && serviceRequest.notes.length > 0 && (
                        <Badge bg="secondary" className="ms-2">
                          {serviceRequest.notes.length}
                        </Badge>
                      )}
                    </Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="parts">
                      Parts Used
                      {serviceRequest.partsUsed && serviceRequest.partsUsed.length > 0 && (
                        <Badge bg="secondary" className="ms-2">
                          {serviceRequest.partsUsed.length}
                        </Badge>
                      )}
                    </Nav.Link>
                  </Nav.Item>
                  {serviceRequest.customerFeedback && serviceRequest.customerFeedback.rating && (
                    <Nav.Item>
                      <Nav.Link eventKey="feedback">Customer Feedback</Nav.Link>
                    </Nav.Item>
                  )}
                </Nav>

                <div className="d-grid gap-2">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPartsModal(true)}
                  >
                    <i className="fas fa-tools"></i> Add Parts Used
                  </Button>
                  
                  {!serviceRequest.customerFeedback && (
                    <Button
                      variant="outline-info"
                      onClick={() => setShowFeedbackModal(true)}
                    >
                      <i className="fas fa-star"></i> Add Customer Feedback
                    </Button>
                  )}
                </div>
              </Col>
              
              <Col md={9}>
                <Tab.Content>
                  {/* Details Tab */}
                  <Tab.Pane eventKey="details">
                    <Card>
                      <Card.Header>Service Request Details</Card.Header>
                      <Card.Body>
                        <h5>{serviceRequest.title}</h5>
                        <p className="text-muted">
                          Created on {formatLocalDateTime(serviceRequest.createdAt)}
                          {serviceRequest.assignedTo && (
                            <span> • Assigned to {serviceRequest.assignedTo.name}</span>
                          )}
                        </p>
                        
                        <Card.Title>Description</Card.Title>
                        <Card.Text style={{ whiteSpace: 'pre-line' }}>
                          {serviceRequest.description}
                        </Card.Text>
                        
                        {serviceRequest.resolution && serviceRequest.resolution.description && (
                          <>
                            <Card.Title className="mt-4">Resolution</Card.Title>
                            <Card.Text style={{ whiteSpace: 'pre-line' }}>
                              {serviceRequest.resolution.description}
                            </Card.Text>
                            <p className="text-muted">
                              Resolved on {formatLocalDateTime(serviceRequest.resolution.date)}
                              {serviceRequest.resolution.resolvedBy && (
                                <span> by {serviceRequest.resolution.resolvedBy.name}</span>
                              )}
                            </p>
                          </>
                        )}
                        
                        <Row className="mt-4">
                          <Col md={6}>
                            <Card.Title>Time Information</Card.Title>
                            <ListGroup variant="flush">
                              <ListGroup.Item>
                                <strong>Estimated Hours:</strong>{' '}
                                {serviceRequest.estimatedHours || 'N/A'}
                              </ListGroup.Item>
                              <ListGroup.Item>
                                <strong>Actual Hours:</strong>{' '}
                                {serviceRequest.actualHours || 'N/A'}
                              </ListGroup.Item>
                            </ListGroup>
                          </Col>
                          
                          {serviceRequest.cost && (
                            <Col md={6}>
                              <Card.Title>Cost Information</Card.Title>
                              <ListGroup variant="flush">
                                <ListGroup.Item>
                                  <strong>Labor Cost:</strong>{' '}
                                  ${serviceRequest.cost.laborCost || '0'}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                  <strong>Parts Cost:</strong>{' '}
                                  ${serviceRequest.cost.partsCost || '0'}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                  <strong>Total Cost:</strong>{' '}
                                  ${serviceRequest.cost.totalCost || '0'}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                  <strong>Invoiced:</strong>{' '}
                                  {serviceRequest.cost.invoiced ? 'Yes' : 'No'}
                                  {serviceRequest.cost.invoiceNumber && (
                                    <span> (Invoice #{serviceRequest.cost.invoiceNumber})</span>
                                  )}
                                </ListGroup.Item>
                                {serviceRequest.cost.paymentStatus && (
                                  <ListGroup.Item>
                                    <strong>Payment Status:</strong>{' '}
                                    <Badge
                                      bg={
                                        serviceRequest.cost.paymentStatus === 'paid'
                                          ? 'success'
                                          : serviceRequest.cost.paymentStatus === 'partial'
                                          ? 'warning'
                                          : serviceRequest.cost.paymentStatus === 'waived'
                                          ? 'info'
                                          : 'secondary'
                                      }
                                    >
                                      {serviceRequest.cost.paymentStatus}
                                    </Badge>
                                  </ListGroup.Item>
                                )}
                              </ListGroup>
                            </Col>
                          )}
                        </Row>
                      </Card.Body>
                    </Card>
                  </Tab.Pane>

                  {/* Customer Info Tab */}
                  <Tab.Pane eventKey="customer">
                    <Card>
                      <Card.Header>Customer Information</Card.Header>
                      <Card.Body>
                        {serviceRequest.customer ? (
                          <>
                            <h5>{serviceRequest.customer.name}</h5>
                            <p>
                              <i className="fas fa-envelope me-2"></i>
                              <a href={`mailto:${serviceRequest.customer.email}`}>
                                {serviceRequest.customer.email}
                              </a>
                            </p>
                            {serviceRequest.customer.phone && (
                              <p>
                                <i className="fas fa-phone me-2"></i>
                                <a href={`tel:${serviceRequest.customer.phone}`}>
                                  {serviceRequest.customer.phone}
                                </a>
                              </p>
                            )}
                            {serviceRequest.customer.address && (
                              <p>
                                <i className="fas fa-map-marker-alt me-2"></i>
                                {formatAddress(serviceRequest.customer.address)}
                              </p>
                            )}
                          </>
                        ) : (
                          <p>No customer information available.</p>
                        )}
                        
                        <Card.Title className="mt-4">Project Information</Card.Title>
                        {serviceRequest.project ? (
                          <>
                            <p>
                              <strong>Contract Number:</strong> {serviceRequest.project.contractNumber || 'N/A'}
                            </p>
                            {serviceRequest.project.type && (
                              <p>
                                <strong>System Type:</strong> {serviceRequest.project.type.replace('_', ' ')}
                              </p>
                            )}
                            {serviceRequest.project.capacity && (
                              <p>
                                <strong>System Capacity:</strong> {serviceRequest.project.capacity} KW
                              </p>
                            )}
                          </>
                        ) : (
                          <p>
                            <Badge bg="secondary">Standalone Service</Badge>
                            <span className="ms-2 text-muted">This service is not associated with any project.</span>
                          </p>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab.Pane>

                  {/* Notes Tab */}
                  <Tab.Pane eventKey="notes">
                    <Card>
                      <Card.Header>Notes & Updates</Card.Header>
                      <Card.Body>
                        <Form className="mb-4">
                          <Form.Group controlId="newNote">
                            <Form.Label>Add Note</Form.Label>
                            <Form.Control
                              as="textarea"
                              rows={3}
                              value={newNote}
                              onChange={(e) => setNewNote(e.target.value)}
                              placeholder="Enter a new note or update"
                            />
                          </Form.Group>
                          <Button
                            variant="primary"
                            className="mt-2"
                            disabled={!newNote}
                            onClick={() => {
                              // Add note logic would go here
                              alert('Note adding functionality would be implemented here.');
                              setNewNote('');
                            }}
                          >
                            Add Note
                          </Button>
                        </Form>
                        
                        {serviceRequest.notes && serviceRequest.notes.length > 0 ? (
                          <div className="timeline">
                            {serviceRequest.notes.map((note, index) => (
                              <div key={index} className="timeline-item">
                                <Card className="mb-3">
                                  <Card.Body>
                                    <Card.Text>{note.text}</Card.Text>
                                    <small className="text-muted">
                                      {formatLocalDateTime(note.createdAt)}
                                      {note.createdBy && (
                                        <span> by {note.createdBy.name || 'User'}</span>
                                      )}
                                    </small>
                                  </Card.Body>
                                </Card>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted">No notes or updates yet.</p>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab.Pane>

                  {/* Parts Used Tab */}
                  <Tab.Pane eventKey="parts">
                    <Card>
                      <Card.Header>Parts Used</Card.Header>
                      <Card.Body>
                        <div className="d-flex justify-content-end mb-3">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setShowPartsModal(true)}
                          >
                            <i className="fas fa-plus"></i> Add Part
                          </Button>
                        </div>
                        
                        {serviceRequest.partsUsed && serviceRequest.partsUsed.length > 0 ? (
                          <Table striped bordered hover responsive>
                            <thead>
                              <tr>
                                <th>Part Name</th>
                                <th>Part Number</th>
                                <th>Quantity</th>
                                <th>Cost</th>
                                <th>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {serviceRequest.partsUsed.map((part, index) => (
                                <tr key={index}>
                                  <td>{part.name}</td>
                                  <td>{part.partNumber || 'N/A'}</td>
                                  <td>{part.quantity}</td>
                                  <td>${part.cost.toFixed(2)}</td>
                                  <td>${(part.quantity * part.cost).toFixed(2)}</td>
                                </tr>
                              ))}
                              <tr className="table-active">
                                <td colSpan={4} className="text-end">
                                  <strong>Total Parts Cost:</strong>
                                </td>
                                <td>
                                  <strong>
                                    ${
                                      serviceRequest.partsUsed
                                        .reduce((sum, part) => sum + part.quantity * part.cost, 0)
                                        .toFixed(2)
                                    }
                                  </strong>
                                </td>
                              </tr>
                            </tbody>
                          </Table>
                        ) : (
                          <p className="text-muted">No parts have been used for this service request.</p>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab.Pane>

                  {/* Customer Feedback Tab */}
                  {serviceRequest.customerFeedback && serviceRequest.customerFeedback.rating && (
                    <Tab.Pane eventKey="feedback">
                      <Card>
                        <Card.Header>Customer Feedback</Card.Header>
                        <Card.Body>
                          <div className="text-center mb-4">
                            <h5>Customer Rating</h5>
                            <div className="mb-2">
                              {[...Array(5)].map((_, i) => (
                                <i
                                  key={i}
                                  className={
                                    i < serviceRequest.customerFeedback.rating
                                      ? 'fas fa-star text-warning'
                                      : 'far fa-star'
                                  }
                                  style={{ fontSize: '24px', margin: '0 5px' }}
                                ></i>
                              ))}
                            </div>
                            <h4>{serviceRequest.customerFeedback.rating} / 5</h4>
                          </div>
                          
                          {serviceRequest.customerFeedback.comments && (
                            <>
                              <h5>Comments</h5>
                              <Card>
                                <Card.Body style={{ whiteSpace: 'pre-line' }}>
                                  {serviceRequest.customerFeedback.comments}
                                </Card.Body>
                              </Card>
                            </>
                          )}
                          
                          <p className="text-muted mt-3">
                            Feedback provided on {formatLocalDateTime(serviceRequest.customerFeedback.date)}
                          </p>
                        </Card.Body>
                      </Card>
                    </Tab.Pane>
                  )}
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>

          {/* Status Update Modal */}
          <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Update Status</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group controlId="statusSelect" className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Control
                  as="select"
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="new">New</option>
                  <option value="assigned">Assigned</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="on_hold">On Hold</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Control>
              </Form.Group>
              
              <Form.Group controlId="statusNotes">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Add notes about this status change"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowStatusModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleStatusUpdate}
                disabled={!statusUpdate.status}
              >
                Update Status
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Add Parts Modal */}
          <Modal show={showPartsModal} onHide={() => setShowPartsModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Add Parts Used</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group controlId="partName" className="mb-3">
                <Form.Label>Part Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter part name"
                  value={newPart.name}
                  onChange={(e) => setNewPart(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </Form.Group>
              
              <Form.Group controlId="partNumber" className="mb-3">
                <Form.Label>Part Number (Optional)</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter part number"
                  value={newPart.partNumber}
                  onChange={(e) => setNewPart(prev => ({ ...prev, partNumber: e.target.value }))}
                />
              </Form.Group>
              
              <Row>
                <Col>
                  <Form.Group controlId="partQuantity" className="mb-3">
                    <Form.Label>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      min="1"
                      value={newPart.quantity}
                      onChange={(e) => setNewPart(prev => ({ ...prev, quantity: e.target.value }))}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group controlId="partCost" className="mb-3">
                    <Form.Label>Cost Per Unit</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      value={newPart.cost}
                      onChange={(e) => setNewPart(prev => ({ ...prev, cost: e.target.value }))}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <div className="d-flex justify-content-between">
                <div>
                  <strong>Total Cost:</strong>
                </div>
                <div>
                  ${(newPart.quantity * newPart.cost).toFixed(2)}
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowPartsModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddPart}
                disabled={!newPart.name || newPart.quantity < 1}
              >
                Add Part
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Customer Feedback Modal */}
          <Modal show={showFeedbackModal} onHide={() => setShowFeedbackModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Add Customer Feedback</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group controlId="feedbackRating" className="mb-3">
                <Form.Label>Rating</Form.Label>
                <div className="d-flex justify-content-center mb-2">
                  {[...Array(5)].map((_, i) => (
                    <i
                      key={i}
                      className={i < feedback.rating ? 'fas fa-star text-warning' : 'far fa-star'}
                      style={{ fontSize: '24px', margin: '0 5px', cursor: 'pointer' }}
                      onClick={() => setFeedback(prev => ({ ...prev, rating: i + 1 }))}
                    ></i>
                  ))}
                </div>
                <div className="text-center mb-3">
                  <strong>{feedback.rating} / 5</strong>
                </div>
              </Form.Group>
              
              <Form.Group controlId="feedbackComments">
                <Form.Label>Comments</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={feedback.comments}
                  onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                  placeholder="Enter customer comments"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowFeedbackModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleAddFeedback}
              >
                Save Feedback
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      ) : (
        <Message variant="info">Service request not found</Message>
      )}
    </>
  );
};

export default ServiceRequestDetailsPage;