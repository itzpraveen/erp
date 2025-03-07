import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Badge, 
  ListGroup, 
  Tab, 
  Nav, 
  Form, 
  Modal,
  Alert
} from 'react-bootstrap';
import { 
  getProposalById,
  submitProposal,
  managerApproveProposal,
  adminApproveProposal,
  requestAdjustments
} from '../features/proposals/proposalSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';

const ProposalApprovalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { proposal, isLoading, isError, message } = useSelector(
    (state) => state.proposals
  );
  const { userInfo } = useSelector((state) => state.auth);
  
  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalComments, setApprovalComments] = useState('');
  const [approvalAction, setApprovalAction] = useState(''); // 'manager', 'admin', 'adjust'
  
  // Adjustments state
  const [adjustmentRequests, setAdjustmentRequests] = useState([]);
  const [newAdjustment, setNewAdjustment] = useState({
    field: '',
    currentValue: '',
    requestedValue: '',
    comments: ''
  });
  
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      dispatch(getProposalById(id));
    }
  }, [dispatch, id, userInfo, navigate]);
  
  // Check if user can approve
  const canManagerApprove = userInfo && 
    (userInfo.permissions?.proposal?.approve || userInfo.role === 'admin') && 
    proposal?.approvalStatus === 'submitted';
    
  const canAdminApprove = userInfo && 
    (userInfo.permissions?.proposal?.finalApprove || userInfo.role === 'admin') && 
    proposal?.approvalStatus === 'manager_approved';
  
  const canRequestAdjustments = userInfo && 
    (userInfo.permissions?.proposal?.approve || userInfo.permissions?.proposal?.finalApprove || userInfo.role === 'admin') &&
    (proposal?.approvalStatus === 'submitted' || proposal?.approvalStatus === 'manager_approved');
  
  const canSubmitForApproval = userInfo &&
    (userInfo.permissions?.proposal?.create || userInfo.role === 'admin') &&
    proposal?.approvalStatus === 'draft';
  
  // Handle opening approval modal
  const openApprovalModal = (action) => {
    setApprovalAction(action);
    setApprovalComments('');
    if (action === 'adjust') {
      setAdjustmentRequests([]);
    }
    setShowApprovalModal(true);
  };
  
  // Handle approval submission
  const handleApprovalSubmit = () => {
    if (approvalAction === 'manager') {
      dispatch(managerApproveProposal({
        id,
        comments: approvalComments
      }));
    } else if (approvalAction === 'admin') {
      dispatch(adminApproveProposal({
        id,
        comments: approvalComments
      }));
    } else if (approvalAction === 'adjust') {
      dispatch(requestAdjustments({
        id,
        adjustments: adjustmentRequests,
        comments: approvalComments
      }));
    } else if (approvalAction === 'submit') {
      dispatch(submitProposal({
        id,
        comments: approvalComments
      }));
    }
    
    setShowApprovalModal(false);
  };
  
  // Add new adjustment request
  const addAdjustmentRequest = () => {
    if (!newAdjustment.field || !newAdjustment.requestedValue) return;
    
    setAdjustmentRequests([...adjustmentRequests, newAdjustment]);
    setNewAdjustment({
      field: '',
      currentValue: '',
      requestedValue: '',
      comments: ''
    });
  };
  
  // Remove adjustment request
  const removeAdjustmentRequest = (index) => {
    setAdjustmentRequests(adjustmentRequests.filter((_, i) => i !== index));
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };
  
  // Get status badge color
  const getStatusBadge = (status) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'submitted':
        return 'info';
      case 'manager_approved':
        return 'warning';
      case 'admin_approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'light';
    }
  };
  
  return (
    <>
      <Link to="/proposals" className="btn btn-light my-3">
        Back to Proposals
      </Link>
      
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{message}</Message>
      ) : proposal ? (
        <>
          <Row className="mb-3 align-items-center">
            <Col>
              <h1>Proposal Approval</h1>
              <h4>{proposal.title || 'Untitled Proposal'}</h4>
            </Col>
            <Col className="text-end">
              <Badge bg={getStatusBadge(proposal.approvalStatus)} className="fs-6 p-2">
                {proposal.approvalStatus?.replace('_', ' ').toUpperCase()}
              </Badge>
            </Col>
          </Row>
          
          <Row>
            <Col md={4}>
              <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Approval Information</h5>
                </Card.Header>
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>Current Status:</strong>{' '}
                    <Badge bg={getStatusBadge(proposal.approvalStatus)}>
                      {proposal.approvalStatus?.replace('_', ' ')}
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Business Status:</strong>{' '}
                    <Badge bg={
                      proposal.status === 'accepted' ? 'success' :
                      proposal.status === 'rejected' ? 'danger' :
                      proposal.status === 'negotiating' ? 'warning' :
                      proposal.status === 'sent' ? 'info' :
                      'secondary'
                    }>
                      {proposal.status}
                    </Badge>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Version:</strong> {proposal.version || 1}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Created On:</strong> {formatDate(proposal.createdAt)}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Last Updated:</strong> {formatDate(proposal.updatedAt)}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Created By:</strong> {proposal.createdBy?.name || 'Unknown'}
                  </ListGroup.Item>
                  {proposal.finalApproval?.approvedBy && (
                    <>
                      <ListGroup.Item>
                        <strong>Final Approval Date:</strong>{' '}
                        {formatDate(proposal.finalApproval.approvedAt)}
                      </ListGroup.Item>
                      <ListGroup.Item>
                        <strong>Approved By:</strong>{' '}
                        {proposal.finalApproval.approvedBy.name || 'Admin User'}
                      </ListGroup.Item>
                    </>
                  )}
                </ListGroup>
              </Card>
              
              <Card className="mb-4 shadow-sm">
                <Card.Header className="bg-white">
                  <h5 className="mb-0">Actions</h5>
                </Card.Header>
                <Card.Body>
                  {canSubmitForApproval && (
                    <Button 
                      variant="info" 
                      className="w-100 mb-2"
                      onClick={() => openApprovalModal('submit')}
                    >
                      <i className="fas fa-paper-plane me-2"></i>
                      Submit for Approval
                    </Button>
                  )}
                  
                  {canManagerApprove && (
                    <Button 
                      variant="success" 
                      className="w-100 mb-2"
                      onClick={() => openApprovalModal('manager')}
                    >
                      <i className="fas fa-check-circle me-2"></i>
                      Manager Approval
                    </Button>
                  )}
                  
                  {canAdminApprove && (
                    <Button 
                      variant="danger" 
                      className="w-100 mb-2"
                      onClick={() => openApprovalModal('admin')}
                    >
                      <i className="fas fa-stamp me-2"></i>
                      Final Approval
                    </Button>
                  )}
                  
                  {canRequestAdjustments && (
                    <Button 
                      variant="warning" 
                      className="w-100 mb-2"
                      onClick={() => openApprovalModal('adjust')}
                    >
                      <i className="fas fa-tools me-2"></i>
                      Request Adjustments
                    </Button>
                  )}
                  
                  <Button 
                    variant="primary" 
                    className="w-100"
                    onClick={() => navigate(`/proposals/${id}`)}
                  >
                    <i className="fas fa-eye me-2"></i>
                    View Full Proposal
                  </Button>
                </Card.Body>
              </Card>
            </Col>
            
            <Col md={8}>
              <Tab.Container id="approval-tabs" defaultActiveKey="details">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white p-0">
                    <Nav variant="tabs">
                      <Nav.Item>
                        <Nav.Link eventKey="details">Proposal Details</Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="approval-history">
                          Approval History
                          {proposal.approvalHistory && (
                            <Badge bg="secondary" className="ms-2">
                              {proposal.approvalHistory.length}
                            </Badge>
                          )}
                        </Nav.Link>
                      </Nav.Item>
                      <Nav.Item>
                        <Nav.Link eventKey="adjustments">
                          Adjustment Requests
                          {proposal.adjustmentRequests && (
                            <Badge bg="secondary" className="ms-2">
                              {proposal.adjustmentRequests?.length || 0}
                            </Badge>
                          )}
                        </Nav.Link>
                      </Nav.Item>
                    </Nav>
                  </Card.Header>
                  <Card.Body>
                    <Tab.Content>
                      <Tab.Pane eventKey="details">
                        <Row>
                          <Col md={6}>
                            <h5>Customer Information</h5>
                            <p><strong>Lead:</strong> {proposal.lead?.name || 'N/A'}</p>
                            <p><strong>Customer:</strong> {proposal.customer?.name || 'Not converted'}</p>
                            <p><strong>Contact:</strong> {proposal.lead?.email || 'N/A'}</p>
                            <p><strong>Phone:</strong> {proposal.lead?.phone || 'N/A'}</p>
                            
                            <h5 className="mt-4">System Information</h5>
                            <p><strong>System Capacity:</strong> {proposal.systemDetails?.totalCapacity || 'N/A'} kW</p>
                            <p><strong>Panel Type:</strong> {proposal.systemDetails?.panelType || 'N/A'}</p>
                            <p><strong>Panel Count:</strong> {proposal.systemDetails?.panelCount || 'N/A'}</p>
                          </Col>
                          
                          <Col md={6}>
                            <h5>Financial Details</h5>
                            <p><strong>Total Cost:</strong> {proposal.financialDetails?.totalCost ? 
                                proposal.formatCurrency ? proposal.formatCurrency(proposal.financialDetails.totalCost) :
                                `₹${proposal.financialDetails.totalCost.toLocaleString()}` : 'N/A'}</p>
                            <p><strong>Net Cost:</strong> {proposal.financialDetails?.netCost ? 
                                proposal.formatCurrency ? proposal.formatCurrency(proposal.financialDetails.netCost) :
                                `₹${proposal.financialDetails.netCost.toLocaleString()}` : 'N/A'}</p>
                            
                            <h5 className="mt-4">Timeline</h5>
                            <p><strong>Estimated Install Date:</strong> {formatDate(proposal.estimatedInstallDate)}</p>
                          </Col>
                        </Row>
                        
                        <h5 className="mt-4">Proposal Notes</h5>
                        <Card body className="bg-light">
                          <p className="mb-0">{proposal.notes || 'No additional notes.'}</p>
                        </Card>
                      </Tab.Pane>
                      
                      <Tab.Pane eventKey="approval-history">
                        {proposal.approvalHistory && proposal.approvalHistory.length > 0 ? (
                          <div className="timeline">
                            {proposal.approvalHistory.map((approval, index) => (
                              <Card key={index} className="mb-3">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <Badge bg={
                                      approval.status === 'approved' ? 'success' :
                                      approval.status === 'rejected' ? 'danger' :
                                      approval.status === 'pending_changes' ? 'warning' :
                                      'info'
                                    }>
                                      {approval.status.replace('_', ' ')}
                                    </Badge>
                                    <span className="ms-2">
                                      {approval.approvedBy?.name || 'User'}
                                    </span>
                                  </div>
                                  <small>{formatDate(approval.approvedAt)}</small>
                                </Card.Header>
                                <Card.Body>
                                  <p className="mb-0">{approval.comments || 'No comments'}</p>
                                </Card.Body>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <Alert variant="info">
                            No approval history yet.
                          </Alert>
                        )}
                      </Tab.Pane>
                      
                      <Tab.Pane eventKey="adjustments">
                        {proposal.adjustmentRequests && proposal.adjustmentRequests.length > 0 ? (
                          <>
                            <h5>Adjustment Requests</h5>
                            {proposal.adjustmentRequests.map((adjustment, index) => (
                              <Card key={index} className="mb-3">
                                <Card.Header className="d-flex justify-content-between align-items-center">
                                  <div>
                                    <strong>Field:</strong> {adjustment.field}
                                  </div>
                                  <Badge bg={
                                    adjustment.status === 'implemented' ? 'success' :
                                    adjustment.status === 'rejected' ? 'danger' :
                                    'warning'
                                  }>
                                    {adjustment.status}
                                  </Badge>
                                </Card.Header>
                                <Card.Body>
                                  <Row>
                                    <Col md={6}>
                                      <p><strong>Current Value:</strong></p>
                                      <Card body className="bg-light mb-3">
                                        <p className="mb-0">{adjustment.currentValue}</p>
                                      </Card>
                                    </Col>
                                    <Col md={6}>
                                      <p><strong>Requested Value:</strong></p>
                                      <Card body className="bg-light mb-3">
                                        <p className="mb-0">{adjustment.requestedValue}</p>
                                      </Card>
                                    </Col>
                                  </Row>
                                  <p><strong>Comments:</strong></p>
                                  <Card body className="bg-light">
                                    <p className="mb-0">{adjustment.comments}</p>
                                  </Card>
                                  <div className="text-muted mt-2">
                                    <small>
                                      Requested by {adjustment.requestedBy?.name || 'User'} on {formatDate(adjustment.requestedAt)}
                                    </small>
                                  </div>
                                </Card.Body>
                              </Card>
                            ))}
                          </>
                        ) : (
                          <Alert variant="info">
                            No adjustment requests have been made.
                          </Alert>
                        )}
                      </Tab.Pane>
                    </Tab.Content>
                  </Card.Body>
                </Card>
              </Tab.Container>
            </Col>
          </Row>
          
          {/* Approval Modal */}
          <Modal show={showApprovalModal} onHide={() => setShowApprovalModal(false)} size={approvalAction === 'adjust' ? 'lg' : 'md'}>
            <Modal.Header closeButton>
              <Modal.Title>
                {approvalAction === 'submit' && 'Submit for Approval'}
                {approvalAction === 'manager' && 'Manager Approval'}
                {approvalAction === 'admin' && 'Final Approval'}
                {approvalAction === 'adjust' && 'Request Adjustments'}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {approvalAction === 'adjust' ? (
                <>
                  <h5>Current Adjustment Requests</h5>
                  {adjustmentRequests.length === 0 ? (
                    <Alert variant="info">No adjustment requests added yet.</Alert>
                  ) : (
                    adjustmentRequests.map((adj, index) => (
                      <Card key={index} className="mb-3">
                        <Card.Header className="d-flex justify-content-between align-items-center">
                          <div>Field: {adj.field}</div>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeAdjustmentRequest(index)}
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        </Card.Header>
                        <Card.Body>
                          <p><strong>Current Value:</strong> {adj.currentValue}</p>
                          <p><strong>Requested Value:</strong> {adj.requestedValue}</p>
                          <p><strong>Comments:</strong> {adj.comments}</p>
                        </Card.Body>
                      </Card>
                    ))
                  )}
                  
                  <h5 className="mt-3">Add Adjustment Request</h5>
                  <Form>
                    <Form.Group className="mb-3">
                      <Form.Label>Field Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={newAdjustment.field}
                        onChange={(e) => setNewAdjustment({
                          ...newAdjustment,
                          field: e.target.value
                        })}
                        placeholder="e.g., System Capacity, Total Cost"
                      />
                    </Form.Group>
                    
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Current Value</Form.Label>
                          <Form.Control
                            type="text"
                            value={newAdjustment.currentValue}
                            onChange={(e) => setNewAdjustment({
                              ...newAdjustment,
                              currentValue: e.target.value
                            })}
                            placeholder="Current value in proposal"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Requested Value</Form.Label>
                          <Form.Control
                            type="text"
                            value={newAdjustment.requestedValue}
                            onChange={(e) => setNewAdjustment({
                              ...newAdjustment,
                              requestedValue: e.target.value
                            })}
                            placeholder="Value you're requesting"
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Comments</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={newAdjustment.comments}
                        onChange={(e) => setNewAdjustment({
                          ...newAdjustment,
                          comments: e.target.value
                        })}
                        placeholder="Explanation for this adjustment request"
                      />
                    </Form.Group>
                    
                    <Button
                      variant="outline-primary"
                      onClick={addAdjustmentRequest}
                      disabled={!newAdjustment.field || !newAdjustment.requestedValue}
                    >
                      <i className="fas fa-plus me-2"></i>
                      Add Adjustment
                    </Button>
                  </Form>
                  
                  <hr />
                </>
              ) : null}
              
              <Form.Group>
                <Form.Label>
                  {approvalAction === 'submit' && 'Submission Comments'}
                  {approvalAction === 'manager' && 'Manager Approval Comments'}
                  {approvalAction === 'admin' && 'Final Approval Comments'}
                  {approvalAction === 'adjust' && 'Overall Comments'}
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  value={approvalComments}
                  onChange={(e) => setApprovalComments(e.target.value)}
                  placeholder="Enter your comments here"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowApprovalModal(false)}>
                Cancel
              </Button>
              <Button 
                variant={
                  approvalAction === 'submit' ? 'info' :
                  approvalAction === 'manager' ? 'success' :
                  approvalAction === 'admin' ? 'danger' :
                  'warning'
                }
                onClick={handleApprovalSubmit}
                disabled={
                  approvalAction === 'adjust' && 
                  adjustmentRequests.length === 0
                }
              >
                {approvalAction === 'submit' && 'Submit Proposal'}
                {approvalAction === 'manager' && 'Approve as Manager'}
                {approvalAction === 'admin' && 'Final Approval'}
                {approvalAction === 'adjust' && 'Submit Adjustment Requests'}
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      ) : (
        <Message variant="info">Proposal not found.</Message>
      )}
    </>
  );
};

export default ProposalApprovalPage;