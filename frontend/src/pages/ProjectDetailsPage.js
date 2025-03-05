import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

const ProjectDetailsPage = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';
  
  // Get current user information
  const { userInfo } = useSelector((state) => state.auth);
  
  // Form states
  const [validated, setValidated] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    customer: '',
    contractNumber: '',
    location: '',
    type: 'on-grid',
    startDate: '',
    targetCompletionDate: '',
    capacity: '',
    notes: '',
    budget: '',
    status: 'planning'
  });
  
  // Check authentication
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    }
  }, [navigate, userInfo]);
  
  // Load project data if in edit mode
  useEffect(() => {
    if (!isCreateMode && id) {
      // This would be replaced with an API call in a real implementation
      // Simulating fetching project data
      const fetchProjectData = () => {
        // Mock data for demonstration
        const projectData = {
          _id: id,
          name: 'Sample Project',
          customer: 'customer1',
          contractNumber: `PRJ-${id.substring(0, 4)}`,
          location: 'Sample Location',
          type: 'on-grid',
          startDate: '2023-03-15',
          targetCompletionDate: '2023-05-20',
          capacity: 25,
          notes: 'Sample project notes',
          budget: 150000,
          status: 'planning'
        };
        
        setFormData(projectData);
      };
      
      fetchProjectData();
    }
  }, [isCreateMode, id]);
  
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
    
    // Create a copy of the form data
    const projectData = { ...formData };
    
    // Convert numeric values
    if (projectData.capacity) {
      projectData.capacity = parseFloat(projectData.capacity);
    }
    
    if (projectData.budget) {
      projectData.budget = parseFloat(projectData.budget);
    }
    
    // In a real implementation, this would dispatch an action to save the project
    console.log('Submitting project data:', projectData);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitSuccess(true);
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate('/projects');
      }, 1000);
    }, 500);
  };
  
  return (
    <>
      <Link to="/projects" className="btn btn-light my-3">
        Go Back
      </Link>
      
      <h1 className="mb-4">
        <i className="fas fa-solar-panel me-3 text-warning"></i>
        {isCreateMode ? 'Create New Project' : isEditMode ? 'Edit Project' : 'Project Details'}
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
            {isCreateMode ? 'Project Created!' : 'Project Updated!'}
          </Alert.Heading>
          <p>
            {isCreateMode 
              ? 'Your project has been successfully created.' 
              : 'Your project has been successfully updated.'}
          </p>
        </Alert>
      )}
      
      <Card className="shadow-sm border-0">
        <Card.Body>
          <Form noValidate validated={validated} onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group controlId="name" className="mb-3">
                  <Form.Label>Project Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter project name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a project name.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group controlId="customer" className="mb-3">
                  <Form.Label>Customer</Form.Label>
                  <Form.Select
                    name="customer"
                    value={formData.customer}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Customer</option>
                    {/* Customer options would be populated from API */}
                    <option value="customer1">Rajan Sharma</option>
                    <option value="customer2">Green Valley Resort</option>
                    <option value="customer3">Govt FHC</option>
                    <option value="customer4">Janatha Home World</option>
                    <option value="customer5">KM Rexine</option>
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select a customer.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group controlId="contractNumber" className="mb-3">
                  <Form.Label>Contract Number</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter contract number"
                    name="contractNumber"
                    value={formData.contractNumber}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a contract number.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group controlId="location" className="mb-3">
                  <Form.Label>Installation Location</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter installation location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide an installation location.
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group controlId="type" className="mb-3">
                  <Form.Label>System Type</Form.Label>
                  <Form.Select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                  >
                    <option value="on-grid">On-Grid</option>
                    <option value="off-grid">Off-Grid</option>
                    <option value="hybrid">Hybrid</option>
                  </Form.Select>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group controlId="startDate" className="mb-3">
                      <Form.Label>Start Date</Form.Label>
                      <Form.Control
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please select a start date.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="targetCompletionDate" className="mb-3">
                      <Form.Label>Target Completion</Form.Label>
                      <Form.Control
                        type="date"
                        name="targetCompletionDate"
                        value={formData.targetCompletionDate}
                        onChange={handleChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please select a target completion date.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
                  <Col md={6}>
                    <Form.Group controlId="capacity" className="mb-3">
                      <Form.Label>System Capacity (KW)</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter system capacity"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleChange}
                        required
                      />
                      <Form.Control.Feedback type="invalid">
                        Please enter a valid capacity.
                      </Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="budget" className="mb-3">
                      <Form.Label>Budget (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        step="1000"
                        min="0"
                        placeholder="Enter project budget"
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group controlId="status" className="mb-3">
                  <Form.Label>Project Status</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="planning">Planning</option>
                    <option value="installation">Installation</option>
                    <option value="testing">Testing</option>
                    <option value="completed">Completed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            
            <Form.Group controlId="notes" className="mb-3">
              <Form.Label>Project Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Enter any additional notes or information about the project"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button 
                variant="outline-secondary" 
                className="me-2"
                onClick={() => navigate('/projects')}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                {isCreateMode ? 'Create Project' : 'Update Project'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default ProjectDetailsPage;