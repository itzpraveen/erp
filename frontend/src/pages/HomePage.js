import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';

const HomePage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <div>
      <div className="bg-primary text-white py-5">
        <Container>
          <Row className="align-items-center py-3">
            <Col lg={6}>
              <h1 className="display-4 fw-bold">Solar ERP System</h1>
              <p className="lead mb-4 opacity-75">
                Complete system for managing your solar panel business from lead 
                generation to installation and service management.
              </p>
              {userInfo ? (
                <Link to="/dashboard">
                  <Button variant="light" size="lg" className="px-4 py-2">
                    <i className="fas fa-tachometer-alt me-2"></i> Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button variant="light" size="lg" className="px-4 py-2">
                    <i className="fas fa-sign-in-alt me-2"></i> Sign In
                  </Button>
                </Link>
              )}
            </Col>
            <Col lg={6} className="text-center">
              <img
                src="/solar-panel.jpg"
                alt="Solar Panel"
                className="img-fluid rounded shadow-lg"
                style={{ maxHeight: '400px' }}
              />
            </Col>
          </Row>
        </Container>
      </div>
      
      <Container className="py-5">

        <Row className="mb-5 text-center">
          <Col>
            <h2 className="display-5 fw-bold mb-3">Comprehensive Solar Business Management</h2>
            <p className="lead text-muted mb-0">
              All the tools you need to run a successful solar energy business in one place.
            </p>
          </Col>
        </Row>
        
        <Row className="mb-5">
          <Col md={4}>
            <Card className="mb-4 shadow-sm border-0 h-100">
              <Card.Body className="p-4 text-center">
                <div className="rounded-circle bg-primary bg-opacity-10 p-3 d-inline-flex mb-3">
                  <i className="fas fa-tools fa-2x text-primary"></i>
                </div>
                <h3 className="fw-bold">Service Management</h3>
                <p className="text-muted">
                  Handle post-installation service requests and maintenance scheduling efficiently.
                  Track customer service history and warranty claims.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 shadow-sm border-0 h-100">
              <Card.Body className="p-4 text-center">
                <div className="rounded-circle bg-success bg-opacity-10 p-3 d-inline-flex mb-3">
                  <i className="fas fa-user-plus fa-2x text-success"></i>
                </div>
                <h3 className="fw-bold">Lead Management</h3>
                <p className="text-muted">
                  Track all potential customers from initial contact to proposal
                  creation. Never miss a sales opportunity again.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="mb-4 shadow-sm border-0 h-100">
              <Card.Body className="p-4 text-center">
                <div className="rounded-circle bg-warning bg-opacity-10 p-3 d-inline-flex mb-3">
                  <i className="fas fa-solar-panel fa-2x text-warning"></i>
                </div>
                <h3 className="fw-bold">Project Tracking</h3>
                <p className="text-muted">
                  Manage installation projects with timeline tracking and team
                  assignment. Keep customers updated on progress.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        <hr className="my-5" />
        
        <Row className="align-items-center mb-5">
          <Col lg={6}>
            <h2 className="fw-bold mb-4">Key Features</h2>
            <ul className="list-unstyled">
              <li className="mb-3">
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary p-2 me-3"><i className="fas fa-check"></i></span>
                  <span><strong>Service Request Management</strong> - Track and manage customer service needs</span>
                </div>
              </li>
              <li className="mb-3">
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary p-2 me-3"><i className="fas fa-check"></i></span>
                  <span><strong>Proposal Generation</strong> - Create and export professional PDF proposals</span>
                </div>
              </li>
              <li className="mb-3">
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary p-2 me-3"><i className="fas fa-check"></i></span>
                  <span><strong>Project Timeline</strong> - Track installation progress and milestones</span>
                </div>
              </li>
              <li className="mb-3">
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary p-2 me-3"><i className="fas fa-check"></i></span>
                  <span><strong>Dashboard Analytics</strong> - Real-time business performance metrics</span>
                </div>
              </li>
              <li className="mb-3">
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary p-2 me-3"><i className="fas fa-check"></i></span>
                  <span><strong>Team Collaboration</strong> - Assign tasks and track employee performance</span>
                </div>
              </li>
            </ul>
            {userInfo ? (
              <Link to="/dashboard">
                <Button variant="primary" size="lg" className="mt-3">
                  <i className="fas fa-arrow-right me-2"></i> Get Started
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="primary" size="lg" className="mt-3">
                  <i className="fas fa-sign-in-alt me-2"></i> Sign In to Get Started
                </Button>
              </Link>
            )}
          </Col>
          <Col lg={6} className="text-center">
            <img
              src="/dashboard-preview.png"
              alt="Dashboard Preview"
              className="img-fluid rounded shadow mt-4 mt-lg-0"
            />
          </Col>
        </Row>
      </Container>
      
      <div className="bg-light py-5">
        <Container className="text-center">
          <h2 className="mb-4">Ready to streamline your solar business?</h2>
          <p className="lead mb-4">Join hundreds of solar companies using our ERP system to manage their operations.</p>
          {userInfo ? (
            <Link to="/dashboard">
              <Button variant="primary" size="lg" className="px-4">
                <i className="fas fa-tachometer-alt me-2"></i> Go to Dashboard
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button variant="primary" size="lg" className="px-4">
                <i className="fas fa-sign-in-alt me-2"></i> Sign In
              </Button>
            </Link>
          )}
        </Container>
      </div>
    </div>
  );
};

export default HomePage;