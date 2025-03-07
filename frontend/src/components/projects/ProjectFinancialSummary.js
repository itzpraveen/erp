import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Badge, Button, Form, Modal } from 'react-bootstrap';
import Message from '../Message';
import { formatDate, formatStatus } from '../../utils/formatters';

/**
 * Component to display and manage project financial details
 */
const ProjectFinancialSummary = ({ project, onUpdatePaymentSchedule }) => {
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [editingPaymentIndex, setEditingPaymentIndex] = useState(null);
  const [paymentData, setPaymentData] = useState({
    description: '',
    amount: '',
    dueDate: '',
    status: 'pending',
    paymentDate: '',
    paymentMethod: ''
  });

  // Financial metrics calculated from payment schedule
  const [financialMetrics, setFinancialMetrics] = useState({
    totalValue: 0,
    paymentsReceived: 0,
    pendingPayments: 0,
    overduePayments: 0,
    paymentCompletion: 0
  });

  // Calculate financial metrics whenever the payment schedule changes
  useEffect(() => {
    // Initialize paymentSchedule as an empty array if it doesn't exist
    if (!project.paymentSchedule) {
      console.log('Payment schedule is missing, initializing as empty array');
      project.paymentSchedule = [];
    }
    
    if (project.paymentSchedule && project.paymentSchedule.length > 0) {
      const totalValue = project.paymentSchedule.reduce((sum, payment) => sum + payment.amount, 0);
      const paymentsReceived = project.paymentSchedule
        .filter(p => p.status === 'paid')
        .reduce((sum, payment) => sum + payment.amount, 0);
      const pendingPayments = project.paymentSchedule
        .filter(p => p.status !== 'paid')
        .reduce((sum, payment) => sum + payment.amount, 0);
      const overduePayments = project.paymentSchedule
        .filter(p => p.status === 'overdue')
        .reduce((sum, payment) => sum + payment.amount, 0);
      const paymentCompletion = totalValue > 0 ? Math.round((paymentsReceived / totalValue) * 100) : 0;

      setFinancialMetrics({
        totalValue,
        paymentsReceived,
        pendingPayments,
        overduePayments,
        paymentCompletion
      });
    }
  }, [project.paymentSchedule]);

  const handleAddPayment = () => {
    setPaymentData({
      description: '',
      amount: '',
      dueDate: '',
      status: 'pending',
      paymentDate: '',
      paymentMethod: ''
    });
    setShowAddPaymentModal(true);
  };

  const handleEditPayment = (index) => {
    const payment = project.paymentSchedule[index];
    setPaymentData({
      description: payment.description,
      amount: payment.amount,
      dueDate: payment.dueDate ? payment.dueDate.substring(0, 10) : '',
      status: payment.status,
      paymentDate: payment.paymentDate ? payment.paymentDate.substring(0, 10) : '',
      paymentMethod: payment.paymentMethod || ''
    });
    setEditingPaymentIndex(index);
    setShowEditPaymentModal(true);
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();
    
    // Format payment data
    const formattedPayment = {
      ...paymentData,
      amount: parseFloat(paymentData.amount)
    };
    
    // Create updated payment schedule
    let updatedPaymentSchedule;
    
    if (editingPaymentIndex !== null) {
      // Update existing payment
      updatedPaymentSchedule = project.paymentSchedule.map((payment, index) => 
        index === editingPaymentIndex ? formattedPayment : payment
      );
    } else {
      // Add new payment
      updatedPaymentSchedule = [
        ...project.paymentSchedule,
        formattedPayment
      ];
    }
    
    // Update project with new payment schedule
    onUpdatePaymentSchedule(updatedPaymentSchedule);
    
    // Close modals
    setShowAddPaymentModal(false);
    setShowEditPaymentModal(false);
    setEditingPaymentIndex(null);
  };

  const handleMarkAsPaid = (index) => {
    const payment = project.paymentSchedule[index];
    const today = new Date().toISOString().substring(0, 10);
    
    // Create updated payment
    const updatedPayment = {
      ...payment,
      status: 'paid',
      paymentDate: today
    };
    
    // Update payment schedule
    const updatedPaymentSchedule = project.paymentSchedule.map((p, i) => 
      i === index ? updatedPayment : p
    );
    
    // Update project
    onUpdatePaymentSchedule(updatedPaymentSchedule);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'paid':
        return <Badge bg="success">Paid</Badge>;
      case 'overdue':
        return <Badge bg="danger">Overdue</Badge>;
      case 'pending':
      default:
        return <Badge bg="warning">Pending</Badge>;
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h5 className="mb-0">Financial Summary</h5>
        <Button 
          variant="outline-primary" 
          size="sm" 
          onClick={handleAddPayment}
        >
          <i className="fas fa-plus me-1"></i> Add Payment
        </Button>
      </div>

      {/* Financial Summary Cards */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="bg-light mb-3 h-100">
            <Card.Body>
              <h6 className="text-muted mb-1">Total Contract Value</h6>
              <h4 className="mb-0">₹{financialMetrics.totalValue.toLocaleString()}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-light mb-3 h-100">
            <Card.Body>
              <h6 className="text-muted mb-1">Payments Received</h6>
              <h4 className="mb-0">₹{financialMetrics.paymentsReceived.toLocaleString()}</h4>
              <small className="text-success">{financialMetrics.paymentCompletion}% Complete</small>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-light mb-3 h-100">
            <Card.Body>
              <h6 className="text-muted mb-1">Pending Payments</h6>
              <h4 className="mb-0">₹{financialMetrics.pendingPayments.toLocaleString()}</h4>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="bg-light mb-3 h-100">
            <Card.Body>
              <h6 className="text-muted mb-1">Overdue Payments</h6>
              <h4 className="mb-0 text-danger">₹{financialMetrics.overduePayments.toLocaleString()}</h4>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Payment Schedule */}
      <h6 className="mb-3">Payment Schedule</h6>
      
      {project.paymentSchedule && project.paymentSchedule.length > 0 ? (
        <Table bordered responsive>
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Payment Date</th>
              <th>Payment Method</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {project.paymentSchedule.map((payment, index) => (
              <tr key={index}>
                <td>{payment.description}</td>
                <td>₹{payment.amount.toLocaleString()}</td>
                <td>{formatDate(payment.dueDate)}</td>
                <td>{getStatusBadge(payment.status)}</td>
                <td>{formatDate(payment.paymentDate)}</td>
                <td>{payment.paymentMethod || '-'}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-1"
                    onClick={() => handleEditPayment(index)}
                  >
                    <i className="fas fa-edit"></i>
                  </Button>
                  
                  {payment.status !== 'paid' && (
                    <Button
                      variant="outline-success"
                      size="sm"
                      onClick={() => handleMarkAsPaid(index)}
                    >
                      <i className="fas fa-check"></i>
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            <tr className="table-active">
              <td><strong>Total</strong></td>
              <td colSpan={6}>
                <strong>
                  ₹{financialMetrics.totalValue.toLocaleString()}
                </strong>
              </td>
            </tr>
          </tbody>
        </Table>
      ) : (
        <div>
          <Message variant="info" className="mb-3">
            No payment schedule has been added yet.
          </Message>
          <Button variant="primary" onClick={handleAddPayment}>
            <i className="fas fa-plus me-2"></i> Create Payment Schedule
          </Button>
        </div>
      )}

      {/* Add Payment Modal */}
      <Modal show={showAddPaymentModal} onHide={() => setShowAddPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePaymentSubmit}>
            <Form.Group controlId="description" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Initial Deposit, Milestone Payment"
                value={paymentData.description}
                onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group controlId="amount" className="mb-3">
              <Form.Label>Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                step="1000"
                min="0"
                placeholder="Enter amount"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group controlId="dueDate" className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={paymentData.dueDate}
                onChange={(e) => setPaymentData({...paymentData, dueDate: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group controlId="status" className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={paymentData.status}
                onChange={(e) => setPaymentData({...paymentData, status: e.target.value})}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </Form.Select>
            </Form.Group>
            
            {paymentData.status === 'paid' && (
              <>
                <Form.Group controlId="paymentDate" className="mb-3">
                  <Form.Label>Payment Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData({...paymentData, paymentDate: e.target.value})}
                  />
                </Form.Group>
                
                <Form.Group controlId="paymentMethod" className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                  >
                    <option value="">Select Method</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                  </Form.Select>
                </Form.Group>
              </>
            )}
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowAddPaymentModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Add Payment
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Edit Payment Modal */}
      <Modal show={showEditPaymentModal} onHide={() => setShowEditPaymentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handlePaymentSubmit}>
            <Form.Group controlId="editDescription" className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g., Initial Deposit, Milestone Payment"
                value={paymentData.description}
                onChange={(e) => setPaymentData({...paymentData, description: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group controlId="editAmount" className="mb-3">
              <Form.Label>Amount (₹)</Form.Label>
              <Form.Control
                type="number"
                step="1000"
                min="0"
                placeholder="Enter amount"
                value={paymentData.amount}
                onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group controlId="editDueDate" className="mb-3">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                value={paymentData.dueDate}
                onChange={(e) => setPaymentData({...paymentData, dueDate: e.target.value})}
                required
              />
            </Form.Group>
            
            <Form.Group controlId="editStatus" className="mb-3">
              <Form.Label>Status</Form.Label>
              <Form.Select
                value={paymentData.status}
                onChange={(e) => setPaymentData({...paymentData, status: e.target.value})}
              >
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </Form.Select>
            </Form.Group>
            
            {paymentData.status === 'paid' && (
              <>
                <Form.Group controlId="editPaymentDate" className="mb-3">
                  <Form.Label>Payment Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={paymentData.paymentDate}
                    onChange={(e) => setPaymentData({...paymentData, paymentDate: e.target.value})}
                  />
                </Form.Group>
                
                <Form.Group controlId="editPaymentMethod" className="mb-3">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    value={paymentData.paymentMethod}
                    onChange={(e) => setPaymentData({...paymentData, paymentMethod: e.target.value})}
                  >
                    <option value="">Select Method</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="credit_card">Credit Card</option>
                    <option value="check">Check</option>
                    <option value="cash">Cash</option>
                  </Form.Select>
                </Form.Group>
              </>
            )}
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowEditPaymentModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" type="submit">
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default ProjectFinancialSummary;