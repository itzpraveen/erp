import React, { useState, useEffect, useCallback } from 'react';
import { downloadProposalPdf } from '../utils/pdf/generateProposalPdf';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Alert, 
  Badge,
  Tab,
  Nav,
} from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { 
  getProposalById, 
  resetProposal, 
  createProposal, 
  updateProposal 
} from '../features/proposals/proposalSlice';
import { convertProposalToProject } from '../features/projects/projectSlice';
import { getLeads } from '../features/leads/leadSlice';
import { getLeadById } from '../features/leads/leadSlice';

/* eslint-disable no-unused-vars */
const ProposalDetailsPage = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';
  const leadId = location.state?.leadId;

  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validated, setValidated] = useState(false);
  
  const [formData, setFormData] = useState({
    lead: leadId || '',
    title: '',
    systemDetails: {
      totalCapacity: '',
      panelType: '',
      panelCount: '',
      inverterType: '',
      estimatedProduction: '',
      batteryStorage: false,
      batteryCapacity: '',
    },
    financialDetails: {
      totalCost: '',
      currency: 'INR',
      incentives: [],
      netCost: '',
      paybackPeriod: '',
      financingOptions: [],
      selectedFinancing: '',
    },
    status: 'draft',
    estimatedInstallDate: '',
    notes: '',
  });

  // For incentives management
  const [newIncentive, setNewIncentive] = useState({ name: '', amount: '' });
  
  // For financing options management
  const [newFinancingOption, setNewFinancingOption] = useState({
    name: '',
    termMonths: '',
    monthlyPayment: '',
    interestRate: '',
    downPayment: '',
  });

  const { userInfo } = useSelector((state) => state.auth);
  const { proposal, isLoading, isError, message } = useSelector(
    (state) => state.proposals
  );
  const { lead, leads } = useSelector((state) => state.leads);

  // Load lead if we have a leadId from location state
  useEffect(() => {
    if (leadId && !isEditMode) {
      dispatch(getLeadById(leadId));
    } else if (isCreateMode && !leadId) {
      // Fetch all leads for the dropdown when creating a new proposal
      dispatch(getLeads());
    }
  }, [dispatch, leadId, isEditMode, isCreateMode]);

  // Load proposal if in edit mode or view mode
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else if (!isCreateMode && id) {
      dispatch(getProposalById(id));
    }

    return () => {
      dispatch(resetProposal());
    };
  }, [dispatch, navigate, userInfo, id, isCreateMode]);

  // Populate form with existing proposal data when loaded
  useEffect(() => {
    if (proposal && !isCreateMode) {
      // Deep copy to avoid mutating the original state
      const proposalData = JSON.parse(JSON.stringify(proposal));
      
      // Format date for the form if it exists
      if (proposalData.estimatedInstallDate) {
        const date = new Date(proposalData.estimatedInstallDate);
        proposalData.estimatedInstallDate = date.toISOString().split('T')[0];
      }
      
      setFormData(proposalData);
    }
  }, [proposal, isCreateMode]);

  // Function to calculate net cost
  const calculateNetCost = useCallback(() => {
    const totalCost = parseFloat(formData.financialDetails.totalCost) || 0;
    const incentivesTotal = formData.financialDetails.incentives.reduce(
      (acc, incentive) => acc + (parseFloat(incentive.amount) || 0), 
      0
    );
    
    const netCost = totalCost - incentivesTotal;
    
    setFormData(prevData => ({
      ...prevData,
      financialDetails: {
        ...prevData.financialDetails,
        netCost,
      },
    }));
  }, [formData.financialDetails.totalCost, formData.financialDetails.incentives]);

  // Function to handle basic field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Reset status messages when form is changed
    setSubmitError('');
    setSubmitSuccess(false);
    
    // Handle checkbox type
    const fieldValue = type === 'checkbox' ? checked : value;
    
    // Handle nested objects
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prevData => ({
        ...prevData,
        [parent]: {
          ...prevData[parent],
          [child]: fieldValue,
        },
      }));
    } else {
      setFormData(prevData => ({
        ...prevData,
        [name]: fieldValue,
      }));
    }
  };

  // Handle incentive field changes - this is used in Financial tab which was removed from the simplified code
  const handleIncentiveChange = (e) => {
    const { name, value } = e.target;
    setNewIncentive(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to add incentive - this is used in Financial tab which was removed from the simplified code
  const handleAddIncentive = () => {
    if (newIncentive.name && newIncentive.amount) {
      setFormData(prevData => ({
        ...prevData,
        financialDetails: {
          ...prevData.financialDetails,
          incentives: [
            ...prevData.financialDetails.incentives,
            { 
              name: newIncentive.name, 
              amount: parseFloat(newIncentive.amount) 
            }
          ],
        },
      }));
      
      // Reset the new incentive form
      setNewIncentive({ name: '', amount: '' });
      
      // Recalculate net cost
      calculateNetCost();
    }
  };

  // Function to remove incentive - this is used in Financial tab which was removed from the simplified code
  const handleRemoveIncentive = (index) => {
    setFormData(prevData => ({
      ...prevData,
      financialDetails: {
        ...prevData.financialDetails,
        incentives: prevData.financialDetails.incentives.filter((_, i) => i !== index),
      },
    }));
    
    // Recalculate net cost
    calculateNetCost();
  };

  // Handle financing option field changes - this is used in Financial tab which was removed from the simplified code
  const handleFinancingOptionChange = (e) => {
    const { name, value } = e.target;
    setNewFinancingOption(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to add financing option - this is used in Financial tab which was removed from the simplified code
  const handleAddFinancingOption = () => {
    if (newFinancingOption.name && newFinancingOption.termMonths) {
      setFormData(prevData => ({
        ...prevData,
        financialDetails: {
          ...prevData.financialDetails,
          financingOptions: [
            ...prevData.financialDetails.financingOptions,
            { 
              name: newFinancingOption.name, 
              termMonths: parseInt(newFinancingOption.termMonths),
              monthlyPayment: parseFloat(newFinancingOption.monthlyPayment),
              interestRate: parseFloat(newFinancingOption.interestRate),
              downPayment: parseFloat(newFinancingOption.downPayment),
            }
          ],
        },
      }));
      
      // Reset the new financing option form
      setNewFinancingOption({
        name: '',
        termMonths: '',
        monthlyPayment: '',
        interestRate: '',
        downPayment: '',
      });
    }
  };

  // Function to remove financing option - this is used in Financial tab which was removed from the simplified code
  const handleRemoveFinancingOption = (index) => {
    setFormData(prevData => ({
      ...prevData,
      financialDetails: {
        ...prevData.financialDetails,
        financingOptions: prevData.financialDetails.financingOptions.filter((_, i) => i !== index),
      },
    }));
  };
  /* eslint-enable no-unused-vars */

  // Handle total cost change - recalculate net cost
  useEffect(() => {
    if (formData.financialDetails.totalCost) {
      calculateNetCost();
    }
  }, [formData.financialDetails.totalCost, calculateNetCost]);

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
    if (!formData.lead) {
      setSubmitError('Please select a lead before creating a proposal');
      setValidated(true);
      return;
    }
    
    // Create a copy of the form data
    const proposalData = { ...formData };
    
    // Convert numeric values
    if (proposalData.systemDetails) {
      proposalData.systemDetails.totalCapacity = parseFloat(proposalData.systemDetails.totalCapacity) || 0;
      proposalData.systemDetails.panelCount = parseInt(proposalData.systemDetails.panelCount) || 0;
      proposalData.systemDetails.estimatedProduction = parseFloat(proposalData.systemDetails.estimatedProduction) || 0;
      proposalData.systemDetails.batteryCapacity = parseFloat(proposalData.systemDetails.batteryCapacity) || 0;
    }
    
    if (proposalData.financialDetails) {
      proposalData.financialDetails.totalCost = parseFloat(proposalData.financialDetails.totalCost) || 0;
      proposalData.financialDetails.netCost = parseFloat(proposalData.financialDetails.netCost) || 0;
      proposalData.financialDetails.paybackPeriod = parseFloat(proposalData.financialDetails.paybackPeriod) || 0;
    }
    
    if (isCreateMode) {
      dispatch(createProposal(proposalData))
        .unwrap()
        .then((result) => {
          setSubmitSuccess(true);
          // Redirect after a short delay to show success message
          setTimeout(() => {
            navigate(`/proposals/${result._id}`, { state: { freshCreated: true } });
          }, 1000);
        })
        .catch(err => {
          console.error('Failed to create proposal:', err);
          setSubmitError(err || 'Failed to create proposal. Please try again.');
        });
    } else if (isEditMode) {
      dispatch(updateProposal({ id, proposalData }))
        .unwrap()
        .then(() => {
          setSubmitSuccess(true);
          // Redirect after a short delay to show success message
          setTimeout(() => {
            navigate(`/proposals/${id}`);
          }, 1000);
        })
        .catch(err => {
          console.error('Failed to update proposal:', err);
          setSubmitError(err || 'Failed to update proposal. Please try again.');
        });
    }
  };

  // Create or Edit mode - render form
  if (isCreateMode || isEditMode) {
    return (
      <>
        <Link to="/proposals" state={{ refresh: true }} className="btn btn-light my-3">
          Go Back
        </Link>
        <h1>{isCreateMode ? 'Create New Proposal' : 'Edit Proposal'}</h1>
        {isLoading && <Loader />}
        {isError && <Message variant="danger">{message}</Message>}
        {submitError && (
          <Alert variant="danger">
            <Alert.Heading>Error Creating Proposal</Alert.Heading>
            <p>{submitError}</p>
          </Alert>
        )}
        {submitSuccess && (
          <Alert variant="success">
            <Alert.Heading>
              {isCreateMode ? 'Proposal Created!' : 'Proposal Updated!'}
            </Alert.Heading>
            <p>
              {isCreateMode 
                ? 'Your proposal has been successfully created and is now ready for review.' 
                : 'Your proposal changes have been successfully saved.'}
            </p>
          </Alert>
        )}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Tab.Container id="proposal-tabs" defaultActiveKey="general">
            <Row>
              <Col md={3}>
                <Nav variant="pills" className="flex-column mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="general">General</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="system">System Details</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="financial">Financial Details</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="notes">Notes</Nav.Link>
                  </Nav.Item>
                </Nav>
                <div className="d-grid gap-2 mt-3">
                  <Button variant="primary" type="submit">
                    {isCreateMode ? 'Create Proposal' : 'Save Changes'}
                  </Button>
                </div>
              </Col>
              <Col md={9}>
                <Tab.Content>
                  {/* General Tab */}
                  <Tab.Pane eventKey="general">
                    <Card className="mb-4">
                      <Card.Header>General Information</Card.Header>
                      <Card.Body>
                        <Form.Group controlId="lead" className="mb-3">
                          <Form.Label>Lead</Form.Label>
                          {isCreateMode ? (
                            <>
                            <Form.Control
                              as="select"
                              name="lead"
                              value={formData.lead}
                              onChange={handleChange}
                              required
                              disabled={!!leadId}
                              isInvalid={!formData.lead && submitError}
                              className="mb-2"
                            >
                              <option value="">Select Lead</option>
                              {leadId && lead ? (
                                <option value={lead._id}>
                                  {lead.name} ({lead.email})
                                </option>
                              ) : leads && leads.length > 0 ? (
                                leads.map((leadOption) => (
                                  <option key={leadOption._id} value={leadOption._id}>
                                    {leadOption.name} ({leadOption.email})
                                  </option>
                                ))
                              ) : null}
                            </Form.Control>
                            <Form.Control.Feedback type="invalid">
                              Please select a lead for this proposal.
                            </Form.Control.Feedback>
                            {leads && leads.length === 0 && !isLoading && (
                              <Alert variant="info" className="mt-2">
                                No leads found. <Link to="/leads/new">Create a new lead</Link> first.
                              </Alert>
                            )}
                            </>
                          ) : (
                            <Form.Control 
                              type="text" 
                              value={proposal?.lead?.name || 'N/A'} 
                              disabled 
                            />
                          )}
                        </Form.Group>

                        <Form.Group controlId="title" className="mb-3">
                          <Form.Label>Proposal Title</Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Enter proposal title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            isInvalid={validated && !formData.title}
                          />
                          <Form.Control.Feedback type="invalid">
                            Please provide a title for this proposal.
                          </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group controlId="status" className="mb-3">
                          <Form.Label>Status</Form.Label>
                          <Form.Select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            required
                          >
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="negotiating">Negotiating</option>
                            <option value="accepted">Accepted</option>
                            <option value="rejected">Rejected</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group controlId="estimatedInstallDate" className="mb-3">
                          <Form.Label>Estimated Installation Date</Form.Label>
                          <Form.Control
                            type="date"
                            name="estimatedInstallDate"
                            value={formData.estimatedInstallDate}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </Tab.Pane>

                  {/* System Details Tab */}
                  <Tab.Pane eventKey="system">
                    <Card className="mb-4">
                      <Card.Header>System Details</Card.Header>
                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group controlId="systemDetails.totalCapacity" className="mb-3">
                              <Form.Label>Total Capacity (kW)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.1"
                                placeholder="Enter system capacity in kW"
                                name="systemDetails.totalCapacity"
                                value={formData.systemDetails.totalCapacity}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="systemDetails.panelCount" className="mb-3">
                              <Form.Label>Number of Panels</Form.Label>
                              <Form.Control
                                type="number"
                                placeholder="Enter number of panels"
                                name="systemDetails.panelCount"
                                value={formData.systemDetails.panelCount}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group controlId="systemDetails.panelType" className="mb-3">
                              <Form.Label>Panel Type</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter panel type"
                                name="systemDetails.panelType"
                                value={formData.systemDetails.panelType}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="systemDetails.inverterType" className="mb-3">
                              <Form.Label>Inverter Type</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter inverter type"
                                name="systemDetails.inverterType"
                                value={formData.systemDetails.inverterType}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group controlId="systemDetails.estimatedProduction" className="mb-3">
                          <Form.Label>Estimated Annual Production (kWh)</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="Enter estimated annual production in kWh"
                            name="systemDetails.estimatedProduction"
                            value={formData.systemDetails.estimatedProduction}
                            onChange={handleChange}
                          />
                        </Form.Group>

                        <Form.Group controlId="systemDetails.batteryStorage" className="mb-3">
                          <Form.Check
                            type="checkbox"
                            label="Include Battery Storage"
                            name="systemDetails.batteryStorage"
                            checked={formData.systemDetails.batteryStorage}
                            onChange={handleChange}
                          />
                        </Form.Group>

                        {formData.systemDetails.batteryStorage && (
                          <Form.Group controlId="systemDetails.batteryCapacity" className="mb-3">
                            <Form.Label>Battery Capacity (kWh)</Form.Label>
                            <Form.Control
                              type="number"
                              step="0.1"
                              placeholder="Enter battery capacity in kWh"
                              name="systemDetails.batteryCapacity"
                              value={formData.systemDetails.batteryCapacity}
                              onChange={handleChange}
                            />
                          </Form.Group>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab.Pane>

                  {/* Notes Tab */}
                  <Tab.Pane eventKey="notes">
                    <Card className="mb-4">
                      <Card.Header>Notes & Additional Information</Card.Header>
                      <Card.Body>
                        <Form.Group controlId="notes" className="mb-3">
                          <Form.Label>Notes</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={5}
                            placeholder="Enter any additional notes or details about this proposal"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  </Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </Form>
      </>
    );
  }

  // View mode - display proposal details
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Link to="/proposals" state={{ refresh: true }} className="btn btn-light">
          <i className="fas fa-arrow-left me-1"></i> Go Back
        </Link>
        {isLoading && <div className="d-inline-block"><Loader size="sm" /></div>}
      </div>
      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{message}</Message>
      ) : proposal ? (
        <>
          <Row className="align-items-center mb-3">
            <Col>
              <h1>{proposal.title}</h1>
            </Col>
            <Col className="text-end">
              <Badge bg={
                proposal.status === 'draft' ? 'secondary' :
                proposal.status === 'sent' ? 'primary' :
                proposal.status === 'negotiating' ? 'warning' :
                proposal.status === 'accepted' ? 'success' :
                'danger'
              } className="fs-6 me-2">
                {proposal.status.charAt(0).toUpperCase() + proposal.status.slice(1)}
              </Badge>
              <Button
                variant="primary"
                className="me-2"
                onClick={() => navigate(`/proposals/${proposal._id}/edit`)}
              >
                <i className="fas fa-edit"></i> Edit
              </Button>
              <Button
                variant="secondary"
                className="me-2"
                onClick={() => downloadProposalPdf(proposal, 'Tenaga Solar')}
              >
                <i className="fas fa-file-pdf"></i> Export PDF
              </Button>
              <Button
                variant="info"
                className="me-2"
                onClick={() => navigate(`/proposals/${proposal._id}/approval`)}
              >
                <i className="fas fa-check-circle"></i> Approval Workflow
              </Button>
              {proposal.status === 'accepted' && !proposal.convertedToProject && (
                <Button
                  variant="success"
                  className="me-2"
                  onClick={() => {
                    if (window.confirm('Convert this accepted proposal to a project? This will create a new project with details from this proposal.')) {
                      dispatch(convertProposalToProject(proposal._id))
                        .unwrap()
                        .then(() => {
                          alert('Project created successfully!');
                          navigate('/projects');
                        })
                        .catch(err => {
                          console.error('Failed to convert proposal to project:', err);
                          alert('Failed to convert proposal to project: ' + err);
                        });
                    }
                  }}
                >
                  <i className="fas fa-project-diagram"></i> Convert to Project
                </Button>
              )}
              {proposal.status === 'draft' && (
                <Button
                  variant="success"
                  onClick={() => {
                    dispatch(updateProposal({
                      id: proposal._id,
                      proposalData: { ...proposal, status: 'sent' }
                    })).unwrap()
                    .then(() => {
                      dispatch(getProposalById(proposal._id));
                    })
                    .catch(err => {
                      console.error('Failed to update status:', err);
                    });
                  }}
                >
                  <i className="fas fa-paper-plane"></i> Send Proposal
                </Button>
              )}
            </Col>
          </Row>
        </>
      ) : (
        <Message variant="danger">Proposal not found</Message>
      )}
    </>
  );
};

export default ProposalDetailsPage;