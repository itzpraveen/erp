import React from 'react';
import { Container, Row, Col, Card, Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SolarCalculator from '../components/SolarCalculator/SolarCalculator';

const SolarCalculatorPage = () => {
  return (
    <Container>
      <Breadcrumb className="mt-3">
        <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>
          Home
        </Breadcrumb.Item>
        <Breadcrumb.Item active>Solar Calculator</Breadcrumb.Item>
      </Breadcrumb>
      
      <Row className="mb-4">
        <Col>
          <h1>Solar System Calculator</h1>
          <p className="text-muted">
            Estimate system size, costs, production, and ROI for solar installations.
          </p>
        </Col>
      </Row>
      
      <Row>
        <Col lg={9}>
          <SolarCalculator />
        </Col>
        
        <Col lg={3}>
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-info text-white">
              <h5 className="mb-0">Calculator Guide</h5>
            </Card.Header>
            <Card.Body>
              <h6>How to use this calculator:</h6>
              <ol className="ps-3">
                <li className="mb-2">Enter your monthly electricity usage in kWh</li>
                <li className="mb-2">Specify the percentage of usage you want to offset</li>
                <li className="mb-2">Enter your location's average sun hours</li>
                <li className="mb-2">Review system size and cost estimates</li>
                <li className="mb-2">Explore financial metrics and ROI analysis</li>
              </ol>
              <hr />
              <p className="small text-muted mb-0">
                <strong>Note:</strong> Results are estimates based on provided inputs.
                Actual performance may vary based on installation, weather, and other factors.
              </p>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm mb-4">
            <Card.Header className="bg-success text-white">
              <h5 className="mb-0">Next Steps</h5>
            </Card.Header>
            <Card.Body>
              <p>After running calculations:</p>
              <ul className="ps-3">
                <li className="mb-2">Create a proposal for your customer</li>
                <li className="mb-2">Schedule a site assessment</li>
                <li className="mb-2">Refine estimates with actual roof measurements</li>
                <li className="mb-2">Present detailed financial analysis</li>
              </ul>
              <div className="d-grid gap-2 mt-3">
                <Link to="/proposals/new" className="btn btn-outline-primary btn-sm">
                  Create New Proposal
                </Link>
              </div>
            </Card.Body>
          </Card>
          
          <Card className="shadow-sm">
            <Card.Header className="bg-warning text-dark">
              <h5 className="mb-0">Help Resources</h5>
            </Card.Header>
            <Card.Body>
              <ul className="list-unstyled">
                <li className="mb-2">
                  <i className="fas fa-file-pdf me-2"></i>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Solar Sizing Guide (PDF)
                  </a>
                </li>
                <li className="mb-2">
                  <i className="fas fa-video me-2"></i>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Calculator Tutorial Video
                  </a>
                </li>
                <li className="mb-2">
                  <i className="fas fa-question-circle me-2"></i>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    Common Questions
                  </a>
                </li>
              </ul>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SolarCalculatorPage;