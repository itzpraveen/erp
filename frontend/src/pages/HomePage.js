import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';

const HomePage = () => {
  const { userInfo } = useSelector((state) => state.auth);

  return (
    <Container className="my-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Card className="app-hero text-center shadow">
            <Card.Body>
              <h1 className="mb-4">Energizing the World with Solar Solutions</h1>
              <p className="mb-4 lead">
                Complete system for managing your solar panel business operations.
              </p>
              {userInfo ? (
                <Link to="/dashboard">
                  <Button variant="primary" size="lg">
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button variant="primary" size="lg">
                    Login to System
                  </Button>
                </Link>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {!userInfo && (
        <Row className="justify-content-center mt-5">
          <Col md={10} lg={8}>
            <Card className="shadow-sm">
              <Card.Body className="p-4">
                <Row>
                  <Col md={6} className="border-end">
                    <h5 className="fw-bold mb-3">Solar ERP Features</h5>
                    <ul className="mb-0">
                      <li>Lead and Customer Management</li>
                      <li>Proposal Generation</li>
                      <li>Project Tracking</li>
                      <li>Service Request Handling</li>
                      <li>Team Management</li>
                    </ul>
                  </Col>
                  <Col md={6}>
                    <h5 className="fw-bold mb-3">System Benefits</h5>
                    <ul className="mb-0">
                      <li>Streamlined Operations</li>
                      <li>Improved Customer Service</li>
                      <li>Increased Project Visibility</li>
                      <li>Enhanced Team Collaboration</li>
                      <li>Data-Driven Decisions</li>
                    </ul>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default HomePage;