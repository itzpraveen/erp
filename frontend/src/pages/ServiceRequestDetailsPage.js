import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, Button, Form } from 'react-bootstrap';
// Removed unused imports { formatDate, formatStatus } and Alert
import Loader from '../components/Loader';
import Message from '../components/Message';
import {
  getServiceRequestById,
  updateServiceRequest,
  // Removed unused import resetServiceRequest
} from '../features/serviceRequests/serviceRequestSlice';
import { getProjects } from '../features/projects/projectSlice';
import { getCustomers } from '../features/customers/customerSlice';

const ServiceRequestDetailsPage = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';
  const isViewMode = !isCreateMode && !isEditMode;
  
  // Define state for form data
  const initialFormState = {
    title: '',
    description: '',
    requestType: 'maintenance',
    priority: 'medium',
    status: 'new',
    customer: '',
    project: '',
    scheduledDate: '',
    completionDate: '',
    assignedTechnician: '',
    notes: ''
  };
  
  const [formData, setFormData] = useState(initialFormState);
  
  // Removed unused states
  // const [validated, setValidated] = useState(false);
  // const [submitError, setSubmitError] = useState('');
  // const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Get data from Redux store
  const { userInfo } = useSelector((state) => state.auth);
  const { serviceRequest, isLoading, isError, message } = useSelector(
    (state) => state.serviceRequests
  );
  
  // Removed unused state
  // const { projects } = useSelector((state) => state.projects);
  // const { customers } = useSelector((state) => state.customers);
  
  // Check authentication and load data
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      // Load service request if in edit or view mode
      if (!isCreateMode && id) {
        dispatch(getServiceRequestById(id));
      }
      
      // Load projects and customers for dropdowns
      dispatch(getProjects());
      dispatch(getCustomers());
    }
  }, [dispatch, navigate, userInfo, id, isCreateMode]);
  
  // Populate form with service request data when loaded
  useEffect(() => {
    if (serviceRequest && !isCreateMode) {
      // Format dates for input fields
      let formattedData = {
        ...serviceRequest,
        scheduledDate: serviceRequest.scheduledDate ? serviceRequest.scheduledDate.substring(0, 10) : '',
        completionDate: serviceRequest.completionDate ? serviceRequest.completionDate.substring(0, 10) : '',
        customer: serviceRequest.customer?._id || serviceRequest.customer || '',
        project: serviceRequest.project?._id || serviceRequest.project || ''
      };
      
      setFormData(formattedData);
    }
  }, [serviceRequest, isCreateMode]);
  
  // Removed unused function handleChange
  
  // Removed unused function handleSubmit
  
  // For view mode, render service request details
  if (isViewMode) {
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
            <Row className="mb-3">
              <Col md={9}>
                <h1>Service Request: {serviceRequest.title}</h1>
              </Col>
              <Col md={3} className="text-end">
                <Button
                  variant="primary"
                  className="me-2"
                  onClick={() => navigate(`/service-requests/${serviceRequest._id}/edit`)}
                >
                  <i className="fas fa-edit"></i> Edit
                </Button>
              </Col>
            </Row>
            
            <Row>
              <Col md={8}>
                <Card className="mb-4">
                  <Card.Header>Request Details</Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <p><strong>Request Type:</strong> {serviceRequest.requestType}</p>
                        <p><strong>Status:</strong> {serviceRequest.status}</p>
                        <p><strong>Priority:</strong> {serviceRequest.priority}</p>
                      </Col>
                      <Col md={6}>
                        <p>
                          <strong>Customer:</strong>{' '}
                          {serviceRequest.customer ? (
                            <Link to={`/customers/${typeof serviceRequest.customer === 'object' ? serviceRequest.customer._id : serviceRequest.customer}`}>
                              {typeof serviceRequest.customer === 'object' ? serviceRequest.customer.name : 'View Customer'}
                            </Link>
                          ) : (
                            'N/A'
                          )}
                        </p>
                        <p>
                          <strong>Project:</strong>{' '}
                          {serviceRequest.project ? (
                            <Link to={`/projects/${typeof serviceRequest.project === 'object' ? serviceRequest.project._id : serviceRequest.project}`}>
                              {typeof serviceRequest.project === 'object' ? serviceRequest.project.name : 'View Project'}
                            </Link>
                          ) : (
                            'N/A'
                          )}
                        </p>
                        <p><strong>Assigned To:</strong> {serviceRequest.assignedTechnician || 'Unassigned'}</p>
                      </Col>
                    </Row>
                    
                    <h5 className="mt-4">Description</h5>
                    <p>{serviceRequest.description}</p>
                    
                    {serviceRequest.notes && (
                      <>
                        <h5 className="mt-4">Notes</h5>
                        <p>{serviceRequest.notes}</p>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Col>
              
              <Col md={4}>
                <Card className="mb-4">
                  <Card.Header>Schedule</Card.Header>
                  <Card.Body>
                    <p>
                      <strong>Scheduled Date:</strong>{' '}
                      {serviceRequest.scheduledDate
                        ? new Date(serviceRequest.scheduledDate).toLocaleDateString()
                        : 'Not scheduled'}
                    </p>
                    <p>
                      <strong>Completion Date:</strong>{' '}
                      {serviceRequest.completionDate
                        ? new Date(serviceRequest.completionDate).toLocaleDateString()
                        : 'Not completed'}
                    </p>
                    <p>
                      <strong>Created On:</strong>{' '}
                      {new Date(serviceRequest.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <strong>Last Updated:</strong>{' '}
                      {new Date(serviceRequest.updatedAt).toLocaleDateString()}
                    </p>
                  </Card.Body>
                </Card>
                
                <Card>
                  <Card.Header>Quick Actions</Card.Header>
                  <Card.Body>
                    <div className="d-grid gap-2">
                      <Button 
                        variant="outline-primary"
                        onClick={() => {
                          dispatch(updateServiceRequest({
                            id: serviceRequest._id,
                            serviceRequestData: {
                              ...serviceRequest,
                              status: 'in_progress'
                            }
                          }))
                            .then(() => dispatch(getServiceRequestById(id)));
                        }}
                        disabled={serviceRequest.status === 'in_progress' || serviceRequest.status === 'completed'}
                      >
                        Mark In Progress
                      </Button>
                      
                      <Button 
                        variant="outline-success"
                        onClick={() => {
                          dispatch(updateServiceRequest({
                            id: serviceRequest._id,
                            serviceRequestData: {
                              ...serviceRequest,
                              status: 'completed',
                              completionDate: new Date().toISOString()
                            }
                          }))
                            .then(() => dispatch(getServiceRequestById(id)));
                        }}
                        disabled={serviceRequest.status === 'completed'}
                      >
                        Mark Completed
                      </Button>
                      
                      <Button 
                        variant="outline-secondary"
                        onClick={() => {
                          // This would open a scheduling modal in a real implementation
                          alert('Schedule functionality would be implemented here');
                        }}
                      >
                        Schedule Service
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          </>
        ) : (
          <Message variant="danger">Service request not found</Message>
        )}
      </>
    );
  }
  
  // For create/edit mode, render a form
  return (
    <>
      <Link to="/service-requests" className="btn btn-light my-3">
        Go Back
      </Link>
      
      <h1>{isCreateMode ? 'Create Service Request' : 'Edit Service Request'}</h1>
      
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{message}</Message>
      ) : (
        <Form onSubmit={(e) => {
          e.preventDefault();
          console.log('Form submitted');
        }}>
          <Row>
            <Col md={8}>
              <Card className="mb-4">
                <Card.Header>Request Details</Card.Header>
                <Card.Body>
                  <Form.Group controlId="title" className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter title"
                      name="title"
                      value={formData.title}
                      required
                    />
                  </Form.Group>
                  
                  <Form.Group controlId="description" className="mb-3">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={4}
                      placeholder="Enter detailed description"
                      name="description"
                      value={formData.description}
                      required
                    />
                  </Form.Group>
                  
                  <Row>
                    <Col md={4}>
                      <Form.Group controlId="requestType" className="mb-3">
                        <Form.Label>Request Type</Form.Label>
                        <Form.Select
                          name="requestType"
                          value={formData.requestType}
                          required
                        >
                          <option value="maintenance">Maintenance</option>
                          <option value="repair">Repair</option>
                          <option value="installation">Installation</option>
                          <option value="inspection">Inspection</option>
                          <option value="other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    
                    <Col md={4}>
                      <Form.Group controlId="priority" className="mb-3">
                        <Form.Label>Priority</Form.Label>
                        <Form.Select
                          name="priority"
                          value={formData.priority}
                          required
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    
                    <Col md={4}>
                      <Form.Group controlId="status" className="mb-3">
                        <Form.Label>Status</Form.Label>
                        <Form.Select
                          name="status"
                          value={formData.status}
                          required
                        >
                          <option value="new">New</option>
                          <option value="scheduled">Scheduled</option>
                          <option value="in_progress">In Progress</option>
                          <option value="on_hold">On Hold</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={4}>
              <Card className="mb-4">
                <Card.Header>Related Information</Card.Header>
                <Card.Body>
                  <Form.Group controlId="customer" className="mb-3">
                    <Form.Label>Customer</Form.Label>
                    <Form.Select
                      name="customer"
                      value={formData.customer}
                    >
                      <option value="">Select Customer</option>
                      {/* We would map through available customers here */}
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group controlId="project" className="mb-3">
                    <Form.Label>Related Project</Form.Label>
                    <Form.Select
                      name="project"
                      value={formData.project}
                    >
                      <option value="">Select Project</option>
                      {/* We would map through available projects here */}
                    </Form.Select>
                  </Form.Group>
                  
                  <Form.Group controlId="assignedTechnician" className="mb-3">
                    <Form.Label>Assigned Technician</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter technician name"
                      name="assignedTechnician"
                      value={formData.assignedTechnician}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
              
              <Card className="mb-4">
                <Card.Header>Schedule</Card.Header>
                <Card.Body>
                  <Form.Group controlId="scheduledDate" className="mb-3">
                    <Form.Label>Scheduled Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="scheduledDate"
                      value={formData.scheduledDate}
                    />
                  </Form.Group>
                  
                  <Form.Group controlId="completionDate" className="mb-3">
                    <Form.Label>Completion Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="completionDate"
                      value={formData.completionDate}
                      disabled={formData.status !== 'completed'}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>
              
              <div className="d-grid">
                <Button variant="primary" type="submit">
                  {isCreateMode ? 'Create Service Request' : 'Update Service Request'}
                </Button>
              </div>
            </Col>
          </Row>
        </Form>
      )}
    </>
  );
};

export default ServiceRequestDetailsPage;