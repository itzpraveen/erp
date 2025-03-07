import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Row, Col, Card, Form, Button, Alert, Nav, Tab, Table, Badge, ListGroup } from 'react-bootstrap';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ProjectFinancialSummary from '../components/projects/ProjectFinancialSummary';
import ProjectForm from '../components/projects/ProjectForm';
import { formatAddress, formatDate, formatStatus } from '../utils/formatters';
import { getProjectById, resetProject, createProject, updateProject } from '../features/projects/projectSlice';
import { getCustomers } from '../features/customers/customerSlice';

const ProjectDetailsPage = ({ mode }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const dispatch = useDispatch();
  
  const isCreateMode = mode === 'create';
  const isEditMode = mode === 'edit';
  // Removed unused variable isViewMode
  
  // Redux state
  const { project, isLoading: projectLoading, isError, message } = useSelector(
    (state) => state.projects
  );
  const { customers, isLoading: customersLoading } = useSelector(
    (state) => state.customers
  );
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

  // Active tab for view mode
  const [activeTab, setActiveTab] = useState('details');
  
  // Check authentication and load project
  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      // Load customers for the dropdown
      dispatch(getCustomers());
      
      if (!isCreateMode && id) {
        dispatch(getProjectById(id));
      }
    }
    
    return () => {
      dispatch(resetProject());
    };
  }, [dispatch, navigate, userInfo, id, isCreateMode]);
  
  // Populate form with project data when loaded from Redux
  useEffect(() => {
    if (project && !isCreateMode) {
      setFormData({
        name: project.name || '',
        customer: project.customer?._id || project.customer || '',
        contractNumber: project.contractNumber || '',
        location: project.location || '',
        type: project.type || 'on-grid',
        startDate: project.startDate ? project.startDate.substring(0, 10) : '',
        targetCompletionDate: project.targetCompletionDate ? project.targetCompletionDate.substring(0, 10) : '',
        capacity: project.capacity || '',
        notes: project.notes || '',
        budget: project.budget || '',
        status: project.status || 'planning'
      });
    }
  }, [project, isCreateMode]);
  
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
  
  // Handle form submission - enhanced version that supports payment schedules
  const handleSubmit = (projectData) => {
    setSubmitError('');
    setSubmitSuccess(false);
    
    console.log('Submitting project data:', projectData);
    
    try {
      if (isCreateMode) {
        // Dispatch create project action
        dispatch(createProject(projectData))
          .unwrap()
          .then((result) => {
            setSubmitSuccess(true);
            // Redirect after a short delay to show success message
            setTimeout(() => {
              navigate('/projects');
            }, 1000);
          })
          .catch((error) => {
            setSubmitError(error || 'Failed to create project');
          });
      } else if (isEditMode && id) {
        // Dispatch update project action
        dispatch(updateProject({ id, projectData }))
          .unwrap()
          .then((result) => {
            setSubmitSuccess(true);
            // Redirect after a short delay to show success message
            setTimeout(() => {
              navigate('/projects');
            }, 1000);
          })
          .catch((error) => {
            setSubmitError(error || 'Failed to update project');
          });
      }
    } catch (error) {
      setSubmitError('An error occurred. Please try again.');
      console.error('Project submission error:', error);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'planning':
        return <Badge bg="info">Planning</Badge>;
      case 'permitting':
        return <Badge bg="warning">Permitting</Badge>;
      case 'scheduled':
        return <Badge bg="primary">Scheduled</Badge>;
      case 'in_progress':
        return <Badge bg="primary">In Progress</Badge>;
      case 'inspection':
        return <Badge bg="warning">Inspection</Badge>;
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      case 'cancelled':
        return <Badge bg="danger">Cancelled</Badge>;
      default:
        return <Badge bg="secondary">{formatStatus(status)}</Badge>;
    }
  };

  // Get system type badge
  const getTypeBadge = (type) => {
    switch (type) {
      case 'on-grid':
        return <Badge bg="primary">On-Grid</Badge>;
      case 'off-grid':
        return <Badge bg="success">Off-Grid</Badge>;
      case 'hybrid':
        return <Badge bg="info">Hybrid</Badge>;
      default:
        return <Badge bg="secondary">{formatStatus(type)}</Badge>;
    }
  };
  
  // Render create/edit form
  const renderForm = () => {
    return (
      <ProjectForm
        isCreateMode={isCreateMode}
        customers={customers}
        customersLoading={customersLoading}
        initialData={formData}
        onSubmit={handleSubmit}
        submitSuccess={submitSuccess}
        submitError={submitError}
      />
    );
  };

  // Render project details in view mode
  const renderProjectDetails = () => {
    if (!project) return <Message variant="info">Project not found</Message>;

    return (
      <Tab.Container id="project-tabs" activeKey={activeTab} onSelect={setActiveTab}>
        <Row>
          <Col md={3}>
            <Card className="mb-4 shadow-sm">
              <Card.Header className="bg-white">
                <h5 className="mb-0">Project Overview</h5>
              </Card.Header>
              <Card.Body>
                <div className="text-center mb-3">
                  {getStatusBadge(project.status)}
                  <h4 className="mt-2 mb-0">{project.name}</h4>
                  <p className="text-muted mb-0">{project.contractNumber}</p>
                </div>
                <hr />
                <ListGroup variant="flush">
                  <ListGroup.Item>
                    <strong>System Type:</strong> {getTypeBadge(project.type)}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Capacity:</strong> {project.capacity} KW
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Start Date:</strong> {formatDate(project.startDate)}
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Target Completion:</strong> {formatDate(project.targetCompletionDate)}
                  </ListGroup.Item>
                  {project.budget && (
                    <ListGroup.Item>
                      <strong>Budget:</strong> ₹{project.budget.toLocaleString()}
                    </ListGroup.Item>
                  )}
                </ListGroup>
              </Card.Body>
              <Card.Footer className="bg-white">
                <Button 
                  variant="outline-primary" 
                  className="w-100 mb-2"
                  onClick={() => navigate(`/projects/${project._id}/edit`)}
                >
                  <i className="fas fa-edit me-2"></i> Edit Project
                </Button>
                {project.proposal && (
                  <Button 
                    variant="outline-info" 
                    className="w-100"
                    onClick={() => navigate(`/proposals/${project.proposal._id}`)}
                  >
                    <i className="fas fa-file-contract me-2"></i> View Proposal
                  </Button>
                )}
              </Card.Footer>
            </Card>

            <Nav variant="pills" className="flex-column">
              <Nav.Item>
                <Nav.Link eventKey="details">
                  <i className="fas fa-info-circle me-2"></i> Project Details
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="customer">
                  <i className="fas fa-user me-2"></i> Customer
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="timeline">
                  <i className="fas fa-calendar-alt me-2"></i> Timeline
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="team">
                  <i className="fas fa-users me-2"></i> Team
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="equipment">
                  <i className="fas fa-solar-panel me-2"></i> Equipment
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="payments">
                  <i className="fas fa-money-bill-wave me-2"></i> Payments
                  <Badge bg="danger" className="ms-2" style={{ fontSize: '0.6rem' }}>New</Badge>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="documents">
                  <i className="fas fa-file-alt me-2"></i> Documents
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>

          <Col md={9}>
            <Tab.Content>
              {/* Project Details Tab */}
              <Tab.Pane eventKey="details">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white d-flex justify-content-between">
                    <h5 className="mb-0">Project Details</h5>
                    {getStatusBadge(project.status)}
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <h6>Basic Information</h6>
                        <Table bordered>
                          <tbody>
                            <tr>
                              <td><strong>Project Name</strong></td>
                              <td>{project.name}</td>
                            </tr>
                            <tr>
                              <td><strong>Contract Number</strong></td>
                              <td>{project.contractNumber}</td>
                            </tr>
                            <tr>
                              <td><strong>Location</strong></td>
                              <td>{project.location}</td>
                            </tr>
                            <tr>
                              <td><strong>System Type</strong></td>
                              <td>{getTypeBadge(project.type)}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Col>
                      <Col md={6}>
                        <h6>System Details</h6>
                        <Table bordered>
                          <tbody>
                            <tr>
                              <td><strong>Capacity</strong></td>
                              <td>{project.capacity} KW</td>
                            </tr>
                            <tr>
                              <td><strong>Estimated Production</strong></td>
                              <td>{project.proposal?.systemDetails?.estimatedProduction || 'N/A'} kWh/year</td>
                            </tr>
                            <tr>
                              <td><strong>Battery Storage</strong></td>
                              <td>{project.proposal?.systemDetails?.batteryStorage ? 'Yes' : 'No'}</td>
                            </tr>
                            <tr>
                              <td><strong>Budget</strong></td>
                              <td>₹{project.budget ? project.budget.toLocaleString() : 'N/A'}</td>
                            </tr>
                          </tbody>
                        </Table>
                      </Col>
                    </Row>

                    {project.notes && (
                      <>
                        <h6 className="mt-4">Project Notes</h6>
                        <Card>
                          <Card.Body style={{ whiteSpace: 'pre-line' }}>
                            {project.notes}
                          </Card.Body>
                        </Card>
                      </>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Customer Tab */}
              <Tab.Pane eventKey="customer">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">Customer Information</h5>
                  </Card.Header>
                  <Card.Body>
                    {project.customer ? (
                      <>
                        <h4 className="mb-3">{project.customer.name}</h4>
                        <Row>
                          <Col md={6}>
                            <Table bordered>
                              <tbody>
                                <tr>
                                  <td><strong>Email</strong></td>
                                  <td>
                                    <a href={`mailto:${project.customer.email}`}>
                                      {project.customer.email}
                                    </a>
                                  </td>
                                </tr>
                                <tr>
                                  <td><strong>Phone</strong></td>
                                  <td>
                                    <a href={`tel:${project.customer.phone}`}>
                                      {project.customer.phone}
                                    </a>
                                  </td>
                                </tr>
                                <tr>
                                  <td><strong>Address</strong></td>
                                  <td>
                                    {project.customer.address ? formatAddress(project.customer.address) : 'N/A'}
                                  </td>
                                </tr>
                                {project.customer.contactPerson && (
                                  <tr>
                                    <td><strong>Contact Person</strong></td>
                                    <td>{project.customer.contactPerson}</td>
                                  </tr>
                                )}
                              </tbody>
                            </Table>
                          </Col>
                          <Col md={6}>
                            <Table bordered>
                              <tbody>
                                <tr>
                                  <td><strong>Customer Type</strong></td>
                                  <td>{formatStatus(project.customer.type)}</td>
                                </tr>
                                {project.customer.gstNumber && (
                                  <tr>
                                    <td><strong>GST Number</strong></td>
                                    <td>{project.customer.gstNumber}</td>
                                  </tr>
                                )}
                                <tr>
                                  <td><strong>Status</strong></td>
                                  <td>{formatStatus(project.customer.status)}</td>
                                </tr>
                                <tr>
                                  <td><strong>Total Projects</strong></td>
                                  <td>{project.customer.totalProjects || 1}</td>
                                </tr>
                              </tbody>
                            </Table>
                          </Col>
                        </Row>

                        {project.customer.notes && (
                          <>
                            <h6 className="mt-4">Customer Notes</h6>
                            <Card>
                              <Card.Body style={{ whiteSpace: 'pre-line' }}>
                                {project.customer.notes}
                              </Card.Body>
                            </Card>
                          </>
                        )}
                      </>
                    ) : (
                      <Message variant="info">No customer information available</Message>
                    )}
                  </Card.Body>
                  <Card.Footer className="bg-white">
                    {project.customer && (
                      <Button 
                        variant="outline-primary" 
                        onClick={() => navigate(`/customers/${project.customer._id}`)}
                      >
                        <i className="fas fa-user me-2"></i> View Full Customer Profile
                      </Button>
                    )}
                  </Card.Footer>
                </Card>
              </Tab.Pane>

              {/* Timeline Tab */}
              <Tab.Pane eventKey="timeline">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">Project Timeline</h5>
                  </Card.Header>
                  <Card.Body>
                    {project.timeline ? (
                      <Table bordered>
                        <thead>
                          <tr>
                            <th>Milestone</th>
                            <th>Date</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Contract Signed</td>
                            <td>{formatDate(project.timeline.contractSigned)}</td>
                            <td>
                              {project.timeline.contractSigned ? (
                                <Badge bg="success">Completed</Badge>
                              ) : (
                                <Badge bg="secondary">Pending</Badge>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Permit Submitted</td>
                            <td>{formatDate(project.timeline.permitSubmitted)}</td>
                            <td>
                              {project.timeline.permitSubmitted ? (
                                <Badge bg="success">Completed</Badge>
                              ) : (
                                <Badge bg="secondary">Pending</Badge>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Permit Approved</td>
                            <td>{formatDate(project.timeline.permitApproved)}</td>
                            <td>
                              {project.timeline.permitApproved ? (
                                <Badge bg="success">Completed</Badge>
                              ) : (
                                <Badge bg="secondary">Pending</Badge>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Installation Start</td>
                            <td>{formatDate(project.timeline.installationStart)}</td>
                            <td>
                              {project.timeline.installationStart ? (
                                <Badge bg="success">Completed</Badge>
                              ) : (
                                <Badge bg="secondary">Pending</Badge>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Installation End</td>
                            <td>{formatDate(project.timeline.installationEnd)}</td>
                            <td>
                              {project.timeline.installationEnd ? (
                                <Badge bg="success">Completed</Badge>
                              ) : (
                                <Badge bg="secondary">Pending</Badge>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Inspection Date</td>
                            <td>{formatDate(project.timeline.inspectionDate)}</td>
                            <td>
                              {project.timeline.inspectionDate ? (
                                <Badge bg="success">Completed</Badge>
                              ) : (
                                <Badge bg="secondary">Pending</Badge>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Grid Connection</td>
                            <td>{formatDate(project.timeline.gridConnectionDate)}</td>
                            <td>
                              {project.timeline.gridConnectionDate ? (
                                <Badge bg="success">Completed</Badge>
                              ) : (
                                <Badge bg="secondary">Pending</Badge>
                              )}
                            </td>
                          </tr>
                          <tr>
                            <td>Project Completion</td>
                            <td>{formatDate(project.timeline.completionDate)}</td>
                            <td>
                              {project.timeline.completionDate ? (
                                <Badge bg="success">Completed</Badge>
                              ) : (
                                <Badge bg="secondary">Pending</Badge>
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </Table>
                    ) : (
                      <Message variant="info">No timeline information available</Message>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Team Tab */}
              <Tab.Pane eventKey="team">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">Project Team</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <h6>Project Manager</h6>
                        {project.projectManager ? (
                          <Card className="mb-4">
                            <Card.Body>
                              <div className="d-flex align-items-center">
                                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                                  <i className="fas fa-user"></i>
                                </div>
                                <div className="ms-3">
                                  <h5 className="mb-0">{project.projectManager.name}</h5>
                                  <p className="text-muted mb-0">{project.projectManager.email}</p>
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        ) : (
                          <Message variant="info">No project manager assigned</Message>
                        )}
                      </Col>
                      <Col md={6}>
                        <h6>Installation Team</h6>
                        {project.installationTeam && project.installationTeam.length > 0 ? (
                          project.installationTeam.map((member, index) => (
                            <Card key={index} className="mb-2">
                              <Card.Body>
                                <div className="d-flex align-items-center">
                                  <div className="rounded-circle bg-info text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                    <i className="fas fa-hard-hat"></i>
                                  </div>
                                  <div className="ms-3">
                                    <h6 className="mb-0">{member.name}</h6>
                                    <p className="text-muted mb-0">{member.email}</p>
                                  </div>
                                </div>
                              </Card.Body>
                            </Card>
                          ))
                        ) : (
                          <Message variant="info">No installation team assigned</Message>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Equipment Tab */}
              <Tab.Pane eventKey="equipment">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">Equipment Used</h5>
                  </Card.Header>
                  <Card.Body>
                    {project.equipmentUsed && project.equipmentUsed.length > 0 ? (
                      <Table bordered responsive>
                        <thead>
                          <tr>
                            <th>Type</th>
                            <th>Manufacturer</th>
                            <th>Model</th>
                            <th>Serial Number</th>
                            <th>Quantity</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.equipmentUsed.map((equipment, index) => (
                            <tr key={index}>
                              <td>{formatStatus(equipment.type)}</td>
                              <td>{equipment.manufacturer}</td>
                              <td>{equipment.model}</td>
                              <td>{equipment.serialNumber}</td>
                              <td>{equipment.quantity}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <Message variant="info">No equipment information available</Message>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Payments Tab */}
              <Tab.Pane eventKey="payments">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">Project Financial Details</h5>
                  </Card.Header>
                  <Card.Body>
                    <ProjectFinancialSummary 
                      project={project} 
                      onUpdatePaymentSchedule={(updatedPaymentSchedule) => {
                        // Update project with new payment schedule
                        const projectData = {
                          ...project,
                          paymentSchedule: updatedPaymentSchedule
                        };
                        dispatch(updateProject({ id: project._id, projectData }));
                      }} 
                    />
                  </Card.Body>
                </Card>
              </Tab.Pane>

              {/* Documents Tab */}
              <Tab.Pane eventKey="documents">
                <Card className="shadow-sm">
                  <Card.Header className="bg-white">
                    <h5 className="mb-0">Project Documents</h5>
                  </Card.Header>
                  <Card.Body>
                    {project.documents && project.documents.length > 0 ? (
                      <Table bordered responsive>
                        <thead>
                          <tr>
                            <th>Document Name</th>
                            <th>Category</th>
                            <th>Upload Date</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {project.documents.map((doc, index) => (
                            <tr key={index}>
                              <td>{doc.name}</td>
                              <td>{doc.category}</td>
                              <td>{formatDate(doc.uploadDate)}</td>
                              <td>
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  as="a"
                                  href={doc.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <i className="fas fa-download me-1"></i> Download
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    ) : (
                      <Message variant="info">No documents available</Message>
                    )}
                  </Card.Body>
                </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    );
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
      
      {projectLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{message}</Message>
      ) : (
        <>
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
          
          {isCreateMode || isEditMode ? renderForm() : renderProjectDetails()}
        </>
      )}
    </>
  );
};

export default ProjectDetailsPage;