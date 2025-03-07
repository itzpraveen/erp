import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Card, Table, Badge, Form, Tabs, Tab, ProgressBar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Loader from '../components/Loader';
import Message from '../components/Message';
import { formatDate, formatStatus } from '../utils/formatters';
import { getProjects, resetProjects } from '../features/projects/projectSlice';

const ProjectsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');

  // Get projects from Redux
  const { projects, isLoading, isError, message } = useSelector(
    (state) => state.projects
  );

  useEffect(() => {
    // Fetch projects from Redux
    dispatch(getProjects());
    
    // Cleanup function
    return () => {
      dispatch(resetProjects());
    };
  }, [dispatch]);
  
  // Log projects data for debugging
  useEffect(() => {
    if (projects.length > 0) {
      console.log('Projects from Redux:', projects);
      console.log('Customers in projects:', projects.map(p => ({
        id: p._id,
        customerObj: p.customer,
        customerRef: typeof p.customer === 'string' ? p.customer : 'object'
      })));
    }
  }, [projects]);

  // Filter projects based on status and active tab
  const filteredProjects = projects.filter((project) => {
    if (statusFilter && project.status !== statusFilter) return false;
    
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['planning', 'installation', 'testing'].includes(project.status);
    if (activeTab === 'completed') return project.status === 'completed';
    
    return true;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'planning':
        return <Badge bg="info">Planning</Badge>;
      case 'installation':
        return <Badge bg="primary">Installation</Badge>;
      case 'testing':
        return <Badge bg="warning">Testing</Badge>;
      case 'completed':
        return <Badge bg="success">Completed</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'on-grid':
        return <Badge bg="primary" className="text-white">On-Grid</Badge>;
      case 'off-grid':
        return <Badge bg="success" className="text-white">Off-Grid</Badge>;
      case 'hybrid':
        return <Badge bg="info" className="text-white">Hybrid</Badge>;
      default:
        return <Badge bg="secondary" className="text-white">{formatStatus(type)}</Badge>;
    }
  };

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="mb-0"><i className="fas fa-solar-panel me-3 text-warning"></i>Projects</h1>
          <p className="text-muted mt-2 mb-0">Manage installation projects from planning to completion</p>
        </Col>
        <Col className="text-end">
          <Link to="/projects/create">
            <Button size="lg" className="my-3">
              <i className="fas fa-plus me-2"></i> Create Project
            </Button>
          </Link>
        </Col>
      </Row>

      <Tabs 
        activeKey={activeTab} 
        onSelect={(k) => setActiveTab(k)} 
        className="mb-4"
      >
        <Tab eventKey="all" title="All Projects" />
        <Tab eventKey="active" title="Active Projects" />
        <Tab eventKey="completed" title="Completed Projects" />
      </Tabs>

      {/* Filters */}
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-white py-3 border-bottom">
          <h5 className="mb-0"><i className="fas fa-filter me-2 text-primary"></i>Filters</h5>
        </Card.Header>
        <Card.Body className="py-4">
          <Row>
            <Col md={3}>
              <Form.Group controlId="statusFilter" className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  <option value="planning">Planning</option>
                  <option value="installation">Installation</option>
                  <option value="testing">Testing</option>
                  <option value="completed">Completed</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <div className="d-flex justify-content-end">
            <Button
              variant="outline-secondary"
              onClick={() => setStatusFilter('')}
              className="me-2"
              disabled={!statusFilter}
            >
              Reset Filter
            </Button>
          </div>
        </Card.Body>
      </Card>

      {isLoading ? (
        <Loader />
      ) : isError ? (
        <Message variant="danger">{message}</Message>
      ) : filteredProjects.length === 0 ? (
        <Message variant="info">
          No projects found
          {statusFilter && " matching the selected filter"}
        </Message>
      ) : (
        <Card className="shadow-sm border-0">
          <Card.Header className="bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
            <h5 className="mb-0"><i className="fas fa-list me-2 text-primary"></i>Project List</h5>
            <span className="badge bg-primary">{filteredProjects.length} projects</span>
          </Card.Header>
          <Card.Body>
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Contract #</th>
                  <th>Project Name</th>
                  <th>Customer</th>
                  <th>Type</th>
                  <th>Capacity</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Timeline</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProjects.map((project) => (
                  <tr key={project._id}>
                    <td>{project.contractNumber}</td>
                    <td>{project.proposal?.title || project.name}</td>
                    <td>{project.customer?.name || 'Unknown'}</td>
                    <td>{getTypeBadge(project.type)}</td>
                    <td>{project.proposal?.systemDetails?.totalCapacity || project.capacity}KW</td>
                    <td>{getStatusBadge(project.status)}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <ProgressBar 
                          now={project.progress} 
                          label={`${project.progress}%`} 
                          style={{ height: '8px', width: '100px' }} 
                          variant={project.progress === 100 ? 'success' : 'primary'}
                          className="me-2"
                        />
                        <span className="small">{project.progress}%</span>
                      </div>
                    </td>
                    <td>
                      <small className="d-block text-muted">Start: {formatDate(project.startDate)}</small>
                      <small className="d-block text-muted">Target: {formatDate(project.targetCompletionDate)}</small>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => navigate(`/projects/${project._id}`)}
                      >
                        <i className="fas fa-eye me-1"></i> View
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => navigate(`/projects/${project._id}/edit`)}
                      >
                        <i className="fas fa-edit me-1"></i> Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* Project Statistics */}
      <Row className="mt-4">
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-bottom">
              <h5 className="mb-0"><i className="fas fa-chart-pie me-2 text-primary"></i>Project Status Summary</h5>
            </Card.Header>
            <Card.Body>
              {['planning', 'installation', 'testing', 'completed'].map(status => {
                const count = projects.filter(p => p.status === status).length;
                const percentage = Math.round((count / projects.length) * 100);
                let variant;
                
                switch(status) {
                  case 'planning': variant = 'info'; break;
                  case 'installation': variant = 'primary'; break;
                  case 'testing': variant = 'warning'; break;
                  case 'completed': variant = 'success'; break;
                  default: variant = 'secondary';
                }
                
                return (
                  <div key={status} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div>
                        <Badge bg={variant} className="me-2">{status.charAt(0).toUpperCase() + status.slice(1)}</Badge>
                        <span>{count} projects</span>
                      </div>
                      <span className="text-muted">{percentage}%</span>
                    </div>
                    <ProgressBar 
                      now={percentage} 
                      variant={variant} 
                      style={{ height: '8px' }} 
                    />
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white py-3 border-bottom">
              <h5 className="mb-0"><i className="fas fa-bolt me-2 text-success"></i>System Type Distribution</h5>
            </Card.Header>
            <Card.Body>
              {['on-grid', 'off-grid', 'hybrid'].map((type, index) => {
                const count = projects.filter(p => p.type === type).length;
                const percentage = Math.round((count / projects.length) * 100);
                const variants = ['primary', 'success', 'info'];
                
                return (
                  <div key={type} className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div>
                        <Badge bg={variants[index]} className="me-2">{type.replace('-', ' ').replace(/(^|\s)\S/g, l => l.toUpperCase())}</Badge>
                        <span>{count} projects</span>
                      </div>
                      <span className="text-muted">{percentage}%</span>
                    </div>
                    <ProgressBar 
                      now={percentage} 
                      variant={variants[index]} 
                      style={{ height: '8px' }} 
                    />
                  </div>
                );
              })}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default ProjectsPage;