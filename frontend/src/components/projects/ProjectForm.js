import React, { useState, useEffect } from 'react';
import { Row, Col, Form, Button, Alert, Card, Table, Badge } from 'react-bootstrap';
import { formatDate } from '../../utils/formatters';

/**
 * Enhanced Project Form Component
 * Includes fields for basic project details, financial information, and equipment
 */
const ProjectForm = ({ 
  isCreateMode, 
  customers, 
  customersLoading, 
  initialData = {}, 
  onSubmit, 
  submitSuccess, 
  submitError 
}) => {
  // Form states
  const [validated, setValidated] = useState(false);
  
  // Project details form data with financial details
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
    status: 'planning',
    // Financial details
    paymentSchedule: []
  });

  // Payment form for adding to payment schedule
  const [paymentData, setPaymentData] = useState({
    description: '',
    amount: '',
    dueDate: '',
    status: 'pending'
  });

  // Populate form with initial data
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        name: initialData.name || '',
        customer: initialData.customer?._id || initialData.customer || '',
        contractNumber: initialData.contractNumber || '',
        location: initialData.location || '',
        type: initialData.type || 'on-grid',
        startDate: initialData.startDate ? initialData.startDate.substring(0, 10) : '',
        targetCompletionDate: initialData.targetCompletionDate ? initialData.targetCompletionDate.substring(0, 10) : '',
        capacity: initialData.capacity || '',
        notes: initialData.notes || '',
        budget: initialData.budget || '',
        status: initialData.status || 'planning',
        paymentSchedule: initialData.paymentSchedule || []
      });
    }
  }, [initialData]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox type
    const fieldValue = type === 'checkbox' ? checked : value;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: fieldValue,
    }));
  };

  // Handle payment form changes
  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  // Add payment to schedule
  const handleAddPayment = () => {
    // Validate payment data
    if (!paymentData.description || !paymentData.amount || !paymentData.dueDate) {
      return; // Don't add invalid payment
    }

    // Parse amount to number
    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount <= 0) {
      return; // Invalid amount
    }

    // Create new payment object
    const newPayment = {
      description: paymentData.description,
      amount,
      dueDate: paymentData.dueDate,
      status: paymentData.status,
      paymentDate: null,
      paymentMethod: null
    };

    // Add to payment schedule
    setFormData(prevData => ({
      ...prevData,
      paymentSchedule: [...(prevData.paymentSchedule || []), newPayment]
    }));

    // Reset payment form
    setPaymentData({
      description: '',
      amount: '',
      dueDate: '',
      status: 'pending'
    });
  };

  // Remove payment from schedule
  const handleRemovePayment = (index) => {
    setFormData(prevData => ({
      ...prevData,
      paymentSchedule: prevData.paymentSchedule.filter((_, i) => i !== index)
    }));
  };

  // Calculate total budget from payment schedule
  const calculateTotalBudget = () => {
    if (!formData.paymentSchedule || formData.paymentSchedule.length === 0) {
      return formData.budget ? parseFloat(formData.budget) : 0;
    }
    
    return formData.paymentSchedule.reduce((total, payment) => {
      return total + (payment.amount || 0);
    }, 0);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
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
    
    // If no budget but has payment schedule, set budget from payment total
    if (!projectData.budget && projectData.paymentSchedule.length > 0) {
      projectData.budget = calculateTotalBudget();
    }
    
    // Call the submit handler
    onSubmit(projectData);
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          {/* Basic Project Information */}
          <h5 className="mb-3">Basic Project Information</h5>
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
                  {!customersLoading && customers && customers.length > 0 ? (
                    customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name}
                      </option>
                    ))
                  ) : (
                    <option disabled>Loading customers...</option>
                  )}
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
                    <Form.Text className="text-muted">
                      {formData.paymentSchedule?.length > 0 ? 
                        `Total from payment schedule: ₹${calculateTotalBudget().toLocaleString()}` : 
                        'Or add payment schedule below'}
                    </Form.Text>
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
                  <option value="permitting">Permitting</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="in_progress">In Progress</option>
                  <option value="inspection">Inspection</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
          
          <Form.Group controlId="notes" className="mb-4">
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
          
          {/* Financial Information */}
          <h5 className="mb-3 mt-4">Financial Information</h5>
          <Card className="mb-4">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Payment Schedule</h6>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3 g-3">
                <Col md={3}>
                  <Form.Group controlId="paymentDescription">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., Deposit"
                      name="description"
                      value={paymentData.description}
                      onChange={handlePaymentChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="paymentAmount">
                    <Form.Label>Amount (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      step="1000"
                      placeholder="0"
                      name="amount"
                      value={paymentData.amount}
                      onChange={handlePaymentChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group controlId="paymentDueDate">
                    <Form.Label>Due Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="dueDate"
                      value={paymentData.dueDate}
                      onChange={handlePaymentChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={2}>
                  <Form.Group controlId="paymentStatus">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={paymentData.status}
                      onChange={handlePaymentChange}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={1} className="d-flex align-items-end">
                  <Button
                    variant="outline-primary"
                    onClick={handleAddPayment}
                    className="w-100"
                  >
                    <i className="fas fa-plus"></i>
                  </Button>
                </Col>
              </Row>
              
              {formData.paymentSchedule && formData.paymentSchedule.length > 0 ? (
                <Table bordered responsive className="mt-3">
                  <thead>
                    <tr>
                      <th>Description</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.paymentSchedule.map((payment, index) => (
                      <tr key={index}>
                        <td>{payment.description}</td>
                        <td>₹{payment.amount.toLocaleString()}</td>
                        <td>{formatDate(payment.dueDate)}</td>
                        <td>
                          <Badge 
                            bg={payment.status === 'paid' ? 'success' : 
                               payment.status === 'overdue' ? 'danger' : 'warning'}
                          >
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </Badge>
                        </td>
                        <td>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleRemovePayment(index)}
                          >
                            <i className="fas fa-trash-alt"></i>
                          </Button>
                        </td>
                      </tr>
                    ))}
                    <tr className="table-active">
                      <td><strong>Total</strong></td>
                      <td colSpan={4}>
                        <strong>₹{calculateTotalBudget().toLocaleString()}</strong>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              ) : (
                <Alert variant="info" className="mt-3">
                  No payment schedule added yet. Add payment installments above.
                </Alert>
              )}
            </Card.Body>
          </Card>
          
          {/* Submit buttons */}
          <div className="d-flex justify-content-end">
            <Button 
              variant="outline-secondary" 
              className="me-2"
              type="button"
              onClick={() => window.history.back()}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {isCreateMode ? 'Create Project' : 'Update Project'}
            </Button>
          </div>
        </Form>

        {/* Success and error messages */}
        {submitSuccess && (
          <Alert variant="success" className="mt-4">
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
        
        {submitError && (
          <Alert variant="danger" className="mt-4">
            <Alert.Heading>Error</Alert.Heading>
            <p>{submitError}</p>
          </Alert>
        )}
      </Card.Body>
    </Card>
  );
};

export default ProjectForm;