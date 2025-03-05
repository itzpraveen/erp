import React, { useState, useEffect } from 'react';
import { downloadProposalPdf } from '../utils/pdf/generateProposalPdf';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  ListGroup, 
  Form, 
  Alert, 
  Badge,
  Tab,
  Nav,
  Table
} from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { 
  getProposalById, 
  resetProposal, 
  createProposal, 
  updateProposal,
  addProposalDocument 
} from '../features/proposals/proposalSlice';
import { getLeads } from '../features/leads/leadSlice';
import { getLeadById } from '../features/leads/leadSlice';

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
  const { proposal, isLoading, isError, isSuccess, message } = useSelector(
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

  // Function to add incentive
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

  // Function to remove incentive
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

  // Function to add financing option
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

  // Function to remove financing option
  const handleRemoveFinancingOption = (index) => {
    setFormData(prevData => ({
      ...prevData,
      financialDetails: {
        ...prevData.financialDetails,
        financingOptions: prevData.financialDetails.financingOptions.filter((_, i) => i !== index),
      },
    }));
  };

  // Function to calculate net cost
  const calculateNetCost = () => {
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
  };

  // Handle incentive field changes
  const handleIncentiveChange = (e) => {
    const { name, value } = e.target;
    setNewIncentive(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle financing option field changes
  const handleFinancingOptionChange = (e) => {
    const { name, value } = e.target;
    setNewFinancingOption(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle total cost change - recalculate net cost
  useEffect(() => {
    if (formData.financialDetails.totalCost) {
      calculateNetCost();
    }
  }, [formData.financialDetails.totalCost]);

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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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

                  {/* Financial Details Tab */}
                  <Tab.Pane eventKey="financial">
                    <Card className="mb-4">
                      <Card.Header>Financial Details</Card.Header>
                      <Card.Body>
                        <Form.Group controlId="financialDetails.totalCost" className="mb-3">
                          <Form.Label>Total System Cost</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.01"
                            placeholder="Enter total system cost"
                            name="financialDetails.totalCost"
                            value={formData.financialDetails.totalCost}
                            onChange={handleChange}
                          />
                        </Form.Group>

                        <Form.Group controlId="incentives" className="mb-3">
                          <Form.Label>Incentives & Rebates</Form.Label>
                          <Card>
                            <Card.Body>
                              <Row className="mb-2">
                                <Col md={5}>
                                  <Form.Control
                                    type="text"
                                    placeholder="Incentive name"
                                    name="name"
                                    value={newIncentive.name}
                                    onChange={handleIncentiveChange}
                                  />
                                </Col>
                                <Col md={5}>
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    placeholder="Amount"
                                    name="amount"
                                    value={newIncentive.amount}
                                    onChange={handleIncentiveChange}
                                  />
                                </Col>
                                <Col md={2}>
                                  <Button 
                                    variant="primary" 
                                    onClick={handleAddIncentive}
                                    className="w-100"
                                  >
                                    Add
                                  </Button>
                                </Col>
                              </Row>

                              {formData.financialDetails.incentives.length > 0 ? (
                                <Table striped bordered hover>
                                  <thead>
                                    <tr>
                                      <th>Incentive</th>
                                      <th>Amount</th>
                                      <th>Action</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {formData.financialDetails.incentives.map((incentive, index) => (
                                      <tr key={index}>
                                        <td>{incentive.name}</td>
                                        <td>{formatCurrency(incentive.amount)}</td>
                                        <td>
                                          <Button 
                                            variant="danger" 
                                            size="sm"
                                            onClick={() => handleRemoveIncentive(index)}
                                          >
                                            Remove
                                          </Button>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              ) : (
                                <p className="text-muted">No incentives added</p>
                              )}
                            </Card.Body>
                          </Card>
                        </Form.Group>

                        <Row>
                          <Col md={6}>
                            <Form.Group controlId="financialDetails.netCost" className="mb-3">
                              <Form.Label>Net Cost (after incentives)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.01"
                                placeholder="Calculated automatically"
                                name="financialDetails.netCost"
                                value={formData.financialDetails.netCost}
                                onChange={handleChange}
                                disabled
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group controlId="financialDetails.paybackPeriod" className="mb-3">
                              <Form.Label>Estimated Payback Period (years)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.1"
                                placeholder="Enter payback period in years"
                                name="financialDetails.paybackPeriod"
                                value={formData.financialDetails.paybackPeriod}
                                onChange={handleChange}
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Form.Group controlId="financingOptions" className="mb-3">
                          <Form.Label>Financing Options</Form.Label>
                          <Card>
                            <Card.Body>
                              <Row className="mb-2">
                                <Col md={4}>
                                  <Form.Control
                                    type="text"
                                    placeholder="Option name"
                                    name="name"
                                    value={newFinancingOption.name}
                                    onChange={handleFinancingOptionChange}
                                    className="mb-2"
                                  />
                                </Col>
                                <Col md={4}>
                                  <Form.Control
                                    type="number"
                                    placeholder="Term (months)"
                                    name="termMonths"
                                    value={newFinancingOption.termMonths}
                                    onChange={handleFinancingOptionChange}
                                    className="mb-2"
                                  />
                                </Col>
                                <Col md={4}>
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    placeholder="Monthly payment"
                                    name="monthlyPayment"
                                    value={newFinancingOption.monthlyPayment}
                                    onChange={handleFinancingOptionChange}
                                    className="mb-2"
                                  />
                                </Col>
                              </Row>
                              <Row className="mb-2">
                                <Col md={4}>
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    placeholder="Interest rate (%)"
                                    name="interestRate"
                                    value={newFinancingOption.interestRate}
                                    onChange={handleFinancingOptionChange}
                                  />
                                </Col>
                                <Col md={4}>
                                  <Form.Control
                                    type="number"
                                    step="0.01"
                                    placeholder="Down payment"
                                    name="downPayment"
                                    value={newFinancingOption.downPayment}
                                    onChange={handleFinancingOptionChange}
                                  />
                                </Col>
                                <Col md={4}>
                                  <Button 
                                    variant="primary" 
                                    onClick={handleAddFinancingOption}
                                    className="w-100"
                                  >
                                    Add Option
                                  </Button>
                                </Col>
                              </Row>

                              {formData.financialDetails.financingOptions.length > 0 ? (
                                <>
                                  <Table striped bordered hover>
                                    <thead>
                                      <tr>
                                        <th>Option</th>
                                        <th>Term</th>
                                        <th>Monthly</th>
                                        <th>Rate</th>
                                        <th>Action</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {formData.financialDetails.financingOptions.map((option, index) => (
                                        <tr key={index}>
                                          <td>{option.name}</td>
                                          <td>{option.termMonths} months</td>
                                          <td>{formatCurrency(option.monthlyPayment)}</td>
                                          <td>{option.interestRate}%</td>
                                          <td>
                                            <Button 
                                              variant="danger" 
                                              size="sm"
                                              onClick={() => handleRemoveFinancingOption(index)}
                                            >
                                              Remove
                                            </Button>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>

                                  <Form.Group controlId="financialDetails.selectedFinancing" className="mt-3">
                                    <Form.Label>Selected Financing Option</Form.Label>
                                    <Form.Select
                                      name="financialDetails.selectedFinancing"
                                      value={formData.financialDetails.selectedFinancing}
                                      onChange={handleChange}
                                    >
                                      <option value="">Select default option</option>
                                      {formData.financialDetails.financingOptions.map((option, index) => (
                                        <option key={index} value={option.name}>
                                          {option.name} - {option.termMonths} months at {option.interestRate}%
                                        </option>
                                      ))}
                                    </Form.Select>
                                  </Form.Group>
                                </>
                              ) : (
                                <p className="text-muted">No financing options added</p>
                              )}
                            </Card.Body>
                          </Card>
                        </Form.Group>
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

          <Tab.Container id="proposal-view-tabs" defaultActiveKey="details">
            <Row>
              <Col md={3}>
                <Card className="mb-3">
                  <Card.Header>Lead Information</Card.Header>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Name:</strong>{' '}
                      {proposal.lead ? (
                        <Link to={`/leads/${proposal.lead._id}`}>
                          {proposal.lead.name}
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </ListGroup.Item>
                    {proposal.lead && proposal.lead.email && (
                      <ListGroup.Item>
                        <strong>Email:</strong>{' '}
                        <a href={`mailto:${proposal.lead.email}`}>{proposal.lead.email}</a>
                      </ListGroup.Item>
                    )}
                    {proposal.lead && proposal.lead.phone && (
                      <ListGroup.Item>
                        <strong>Phone:</strong>{' '}
                        <a href={`tel:${proposal.lead.phone}`}>{proposal.lead.phone}</a>
                      </ListGroup.Item>
                    )}
                    {proposal.lead && proposal.lead.status && (
                      <ListGroup.Item>
                        <strong>Lead Status:</strong>{' '}
                        <Badge bg={
                          proposal.lead.status === 'closed_won' ? 'success' :
                          proposal.lead.status === 'closed_lost' ? 'danger' :
                          proposal.lead.status === 'proposal' ? 'info' :
                          proposal.lead.status === 'qualified' ? 'primary' :
                          'secondary'
                        }>
                          {proposal.lead.status.replace('_', ' ')}
                        </Badge>
                      </ListGroup.Item>
                    )}
                  </ListGroup>
                </Card>

                <Card className="mb-3">
                  <Card.Header>Proposal Info</Card.Header>
                  <ListGroup variant="flush">
                    <ListGroup.Item>
                      <strong>Created:</strong>{' '}
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </ListGroup.Item>
                    <ListGroup.Item>
                      <strong>Created By:</strong>{' '}
                      {proposal.createdBy ? proposal.createdBy.name : 'N/A'}
                    </ListGroup.Item>
                    {proposal.estimatedInstallDate && (
                      <ListGroup.Item>
                        <strong>Install Date:</strong>{' '}
                        {new Date(proposal.estimatedInstallDate).toLocaleDateString()}
                      </ListGroup.Item>
                    )}
                    <ListGroup.Item>
                      <strong>Version:</strong> {proposal.version || 1}
                    </ListGroup.Item>
                  </ListGroup>
                </Card>

                <Nav variant="pills" className="flex-column mb-3">
                  <Nav.Item>
                    <Nav.Link eventKey="details">System Details</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="financial">Financial Details</Nav.Link>
                  </Nav.Item>
                  {proposal.notes && (
                    <Nav.Item>
                      <Nav.Link eventKey="notes">Notes</Nav.Link>
                    </Nav.Item>
                  )}
                  {proposal.documents && proposal.documents.length > 0 && (
                    <Nav.Item>
                      <Nav.Link eventKey="documents">Documents</Nav.Link>
                    </Nav.Item>
                  )}
                </Nav>
              </Col>
              <Col md={9}>
                <Tab.Content>
                  <Tab.Pane eventKey="details">
                    <Card>
                      <Card.Header>System Details</Card.Header>
                      <Card.Body>
                        {proposal.systemDetails ? (
                          <Row>
                            <Col md={6}>
                              <ListGroup variant="flush">
                                <ListGroup.Item>
                                  <strong>Total Capacity:</strong>{' '}
                                  {proposal.systemDetails.totalCapacity ? `${proposal.systemDetails.totalCapacity} kW` : 'N/A'}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                  <strong>Panel Type:</strong>{' '}
                                  {proposal.systemDetails.panelType || 'N/A'}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                  <strong>Panel Count:</strong>{' '}
                                  {proposal.systemDetails.panelCount || 'N/A'}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                  <strong>Inverter Type:</strong>{' '}
                                  {proposal.systemDetails.inverterType || 'N/A'}
                                </ListGroup.Item>
                              </ListGroup>
                            </Col>
                            <Col md={6}>
                              <ListGroup variant="flush">
                                <ListGroup.Item>
                                  <strong>Estimated Production:</strong>{' '}
                                  {proposal.systemDetails.estimatedProduction ? `${proposal.systemDetails.estimatedProduction} kWh/year` : 'N/A'}
                                </ListGroup.Item>
                                <ListGroup.Item>
                                  <strong>Battery Storage:</strong>{' '}
                                  {proposal.systemDetails.batteryStorage ? 'Yes' : 'No'}
                                </ListGroup.Item>
                                {proposal.systemDetails.batteryStorage && (
                                  <ListGroup.Item>
                                    <strong>Battery Capacity:</strong>{' '}
                                    {proposal.systemDetails.batteryCapacity ? `${proposal.systemDetails.batteryCapacity} kWh` : 'N/A'}
                                  </ListGroup.Item>
                                )}
                              </ListGroup>
                            </Col>
                          </Row>
                        ) : (
                          <p>No system details available</p>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab.Pane>

                  <Tab.Pane eventKey="financial">
                    <Card>
                      <Card.Header>Financial Details</Card.Header>
                      <Card.Body>
                        {proposal.financialDetails ? (
                          <>
                            <Row className="mb-4">
                              <Col md={4}>
                                <Card className="text-center h-100">
                                  <Card.Body>
                                    <Card.Title>Total Cost</Card.Title>
                                    <h3>
                                      {proposal.financialDetails.totalCost
                                        ? formatCurrency(proposal.financialDetails.totalCost)
                                        : 'N/A'}
                                    </h3>
                                  </Card.Body>
                                </Card>
                              </Col>
                              <Col md={4}>
                                <Card className="text-center h-100">
                                  <Card.Body>
                                    <Card.Title>Net Cost</Card.Title>
                                    <h3>
                                      {proposal.financialDetails.netCost
                                        ? formatCurrency(proposal.financialDetails.netCost)
                                        : 'N/A'}
                                    </h3>
                                    <small className="text-muted">After incentives</small>
                                  </Card.Body>
                                </Card>
                              </Col>
                              <Col md={4}>
                                <Card className="text-center h-100">
                                  <Card.Body>
                                    <Card.Title>Payback Period</Card.Title>
                                    <h3>
                                      {proposal.financialDetails.paybackPeriod
                                        ? `${proposal.financialDetails.paybackPeriod} years`
                                        : 'N/A'}
                                    </h3>
                                  </Card.Body>
                                </Card>
                              </Col>
                            </Row>

                            {proposal.financialDetails.incentives && proposal.financialDetails.incentives.length > 0 && (
                              <Card className="mb-4">
                                <Card.Header>Incentives & Rebates</Card.Header>
                                <Card.Body>
                                  <Table striped bordered>
                                    <thead>
                                      <tr>
                                        <th>Incentive</th>
                                        <th>Amount</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {proposal.financialDetails.incentives.map((incentive, index) => (
                                        <tr key={index}>
                                          <td>{incentive.name}</td>
                                          <td>{formatCurrency(incentive.amount)}</td>
                                        </tr>
                                      ))}
                                      <tr className="table-primary">
                                        <td><strong>Total Incentives</strong></td>
                                        <td><strong>
                                          {formatCurrency(proposal.financialDetails.incentives.reduce(
                                            (sum, incentive) => sum + (parseFloat(incentive.amount) || 0), 0
                                          ))}
                                        </strong></td>
                                      </tr>
                                    </tbody>
                                  </Table>
                                </Card.Body>
                              </Card>
                            )}

                            {proposal.financialDetails.financingOptions && proposal.financialDetails.financingOptions.length > 0 && (
                              <Card>
                                <Card.Header>Financing Options</Card.Header>
                                <Card.Body>
                                  <Table striped bordered>
                                    <thead>
                                      <tr>
                                        <th>Option</th>
                                        <th>Term</th>
                                        <th>Monthly Payment</th>
                                        <th>Interest Rate</th>
                                        <th>Down Payment</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {proposal.financialDetails.financingOptions.map((option, index) => (
                                        <tr key={index} className={
                                          proposal.financialDetails.selectedFinancing === option.name
                                            ? 'table-success'
                                            : ''
                                        }>
                                          <td>
                                            {option.name}
                                            {proposal.financialDetails.selectedFinancing === option.name && (
                                              <Badge bg="success" className="ms-2">Recommended</Badge>
                                            )}
                                          </td>
                                          <td>{option.termMonths} months</td>
                                          <td>{formatCurrency(option.monthlyPayment)}</td>
                                          <td>{option.interestRate}%</td>
                                          <td>{formatCurrency(option.downPayment)}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </Table>
                                </Card.Body>
                              </Card>
                            )}
                          </>
                        ) : (
                          <p>No financial details available</p>
                        )}
                      </Card.Body>
                    </Card>
                  </Tab.Pane>

                  {proposal.notes && (
                    <Tab.Pane eventKey="notes">
                      <Card>
                        <Card.Header>Notes & Additional Information</Card.Header>
                        <Card.Body>
                          <Card.Text style={{ whiteSpace: 'pre-line' }}>
                            {proposal.notes}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Tab.Pane>
                  )}

                  {proposal.documents && proposal.documents.length > 0 && (
                    <Tab.Pane eventKey="documents">
                      <Card>
                        <Card.Header>Documents</Card.Header>
                        <ListGroup variant="flush">
                          {proposal.documents.map((doc, index) => (
                            <ListGroup.Item key={index}>
                              <i className="fas fa-file me-2"></i>
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                                {doc.name}
                              </a>
                              <Badge bg="secondary" className="ms-2">
                                {doc.fileType}
                              </Badge>
                            </ListGroup.Item>
                          ))}
                        </ListGroup>
                      </Card>
                    </Tab.Pane>
                  )}
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>
        </>
      ) : (
        <Message variant="danger">Proposal not found</Message>
      )}
    </>
  );
};

export default ProposalDetailsPage;