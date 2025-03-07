
import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { getProjects } from '../features/projects/projectSlice';
import { getCustomers } from '../features/customers/customerSlice';

const ServiceRequestForm = ({ 
  onSubmit, 
  initialData = {}, 
  mode = 'create',
  projectId = null 
}) => {
  const dispatch = useDispatch();
  
  // Form state
  const [formData, setFormData] = useState({
    project: projectId || initialData.project || '',
    customer: initialData.customer || '',
    requestType: initialData.requestType || 'maintenance',
    title: initialData.title || '',
    description: initialData.description || '',
    priority: initialData.priority || 'medium',
    scheduledDate: initialData.scheduledDate || '',
    estimatedHours: initialData.estimatedHours || '',
    warrantyRelated: initialData.warrantyRelated || false,
  });

  // Form validation state
  const [validated, setValidated] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Get data from Redux store
  const { projects } = useSelector((state) => state.projects);
  const { customers } = useSelector((state) => state.customers);
  
  // Load projects and customers on mount
  useEffect(() => {
    dispatch(getProjects());
    dispatch(getCustomers());
  }, [dispatch]);
  
  // Update customer when project changes (if in create mode)
  useEffect(() => {
    if (mode === 'create' && formData.project) {
      const selectedProject = projects.find(p => p._id === formData.project);
      if (selectedProject && selectedProject.customer) {
        setFormData(prev => ({
          ...prev,
          customer: selectedProject.customer._id
        }));
      }
    }
  }, [formData.project, projects, mode]);
  
  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Reset error messages when form is changed
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
    
    // Call the parent's onSubmit function
    onSubmit(requestData, setSubmitSuccess, setSubmitError);
  };

  return (
    <Form noValidate validated={validated} onSubmit={handleSubmit}>
      {submitError && (
        <Alert variant="danger">
          <Alert.Heading>Error</Alert.Heading>
          <p>{submitError}</p>
        </Alert>
      )}
      {submitSuccess && (
        <Alert variant="success">
          <Alert.Heading>
            {mode === 'create' ? 'Service Request Created!' : 'Service Request Updated!'}
          </Alert.Heading>
          <p>
            {mode === 'create' 
              ? 'Your service request has been successfully created.' 
              : 'Your service request has been successfully updated.'}
          </p>
        </Alert>
      )}
      
      <Row>
        <Col md={6}>
          <Form.Group controlId="project" className="mb-3">
            <Form.Label>Project (Optional)</Form.Label>
            <Form.Control
              as="select"
              name="project"
              value={formData.project}
              onChange={handleChange}
              disabled={!!projectId || mode === 'edit'}
            >
              <option value="">Select Project (Optional)</option>
              {projects.map(project => (
                <option key={project._id} value={project._id}>
                  {project.contractNumber} - {project.customer ? project.customer.name : 'Unknown Customer'}
                </option>
              ))}
            </Form.Control>
            <Form.Text className="text-muted">
              Leave blank for standalone service not related to any project
            </Form.Text>
          </Form.Group>

          <Form.Group controlId="customer" className="mb-3">
            <Form.Label>Customer</Form.Label>
            <Form.Control
              as="select"
              name="customer"
              value={formData.customer}
              onChange={handleChange}
              required
              disabled={mode === 'edit'}
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} - {customer.propertyType === 'residential' ? 'Residential' : customer.propertyType === 'commercial' ? 'Commercial' : customer.propertyType === 'industrial' ? 'Industrial' : 'Other'}
                </option>
              ))}
            </Form.Control>
            <Form.Control.Feedback type="invalid">
              Please select a customer.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group controlId="title" className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter service request title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a title.
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group controlId="requestType" className="mb-3">
            <Form.Label>Request Type</Form.Label>
            <Form.Control
              as="select"
              name="requestType"
              value={formData.requestType}
              onChange={handleChange}
              required
            >
              <option value="maintenance">Maintenance</option>
              <option value="repair">Repair</option>
              <option value="inspection">Inspection</option>
              <option value="warranty_claim">Warranty Claim</option>
              <option value="system_upgrade">System Upgrade</option>
              <option value="other">Other</option>
            </Form.Control>
          </Form.Group>

          <Form.Group controlId="priority" className="mb-3">
            <Form.Label>Priority</Form.Label>
            <Form.Control
              as="select"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </Form.Control>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group controlId="scheduledDate" className="mb-3">
                <Form.Label>Scheduled Date</Form.Label>
                <Form.Control
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="estimatedHours" className="mb-3">
                <Form.Label>Estimated Hours</Form.Label>
                <Form.Control
                  type="number"
                  step="0.5"
                  placeholder="Enter estimated hours"
                  name="estimatedHours"
                  value={formData.estimatedHours}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
        </Col>
      </Row>

      <Form.Group controlId="description" className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={4}
          placeholder="Enter detailed description of the service request"
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
        />
        <Form.Control.Feedback type="invalid">
          Please provide a description.
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group controlId="warrantyRelated" className="mb-3">
        <Form.Check
          type="checkbox"
          label="This is a warranty-related request"
          name="warrantyRelated"
          checked={formData.warrantyRelated}
          onChange={handleChange}
        />
      </Form.Group>

      <div className="d-flex justify-content-end">
        <Button variant="primary" type="submit">
          {mode === 'create' ? 'Create Service Request' : 'Update Service Request'}
        </Button>
      </div>
    </Form>
  );
};

export default ServiceRequestForm;
