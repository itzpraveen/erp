import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="bg-light border-top mt-5">
      <Container>
        <Row className="py-4">
          <Col lg={4} md={6} className="mb-4 mb-md-0">
            <h5 className="text-primary mb-3">Solar ERP</h5>
            <p className="text-muted">
              Complete system for managing your solar panel business from lead generation to installation and service.
            </p>
            <p className="text-muted mb-0">
              <i className="fas fa-phone me-2 text-primary"></i> Support: (123) 456-7890
            </p>
            <p className="text-muted mb-0">
              <i className="fas fa-envelope me-2 text-primary"></i> support@solarerp.com
            </p>
          </Col>
          <Col lg={4} md={6} className="mb-4 mb-md-0">
            <h5 className="text-primary mb-3">Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <i className="fas fa-chevron-right text-primary me-2 small"></i>
                <a href="/dashboard" className="text-decoration-none text-muted">Dashboard</a>
              </li>
              <li className="mb-2">
                <i className="fas fa-chevron-right text-primary me-2 small"></i>
                <a href="/customers" className="text-decoration-none text-muted">Customers</a>
              </li>
              <li className="mb-2">
                <i className="fas fa-chevron-right text-primary me-2 small"></i>
                <a href="/leads" className="text-decoration-none text-muted">Leads</a>
              </li>
              <li className="mb-2">
                <i className="fas fa-chevron-right text-primary me-2 small"></i>
                <a href="/proposals" className="text-decoration-none text-muted">Proposals</a>
              </li>
              <li className="mb-2">
                <i className="fas fa-chevron-right text-primary me-2 small"></i>
                <a href="/projects" className="text-decoration-none text-muted">Projects</a>
              </li>
              <li className="mb-2">
                <i className="fas fa-chevron-right text-primary me-2 small"></i>
                <a href="/service-requests" className="text-decoration-none text-muted">Service Requests</a>
              </li>
            </ul>
          </Col>
          <Col lg={4} md={12}>
            <h5 className="text-primary mb-3">About Solar ERP</h5>
            <p className="text-muted">
              Solar ERP is designed specifically for solar installation companies to streamline operations, improve customer management, and increase business efficiency.
            </p>
            <div className="d-flex mt-3">
              <a href="#" className="text-decoration-none me-3">
                <i className="fab fa-facebook-square fa-2x text-primary"></i>
              </a>
              <a href="#" className="text-decoration-none me-3">
                <i className="fab fa-twitter-square fa-2x text-primary"></i>
              </a>
              <a href="#" className="text-decoration-none me-3">
                <i className="fab fa-linkedin fa-2x text-primary"></i>
              </a>
              <a href="#" className="text-decoration-none">
                <i className="fab fa-youtube-square fa-2x text-primary"></i>
              </a>
            </div>
          </Col>
        </Row>
        <Row className="border-top py-3 mt-3">
          <Col md={6} className="text-center text-md-start">
            <p className="text-muted mb-0">
              Copyright &copy; Solar ERP {new Date().getFullYear()}. All rights reserved.
            </p>
          </Col>
          <Col md={6} className="text-center text-md-end">
            <p className="text-muted mb-0">
              <a href="/privacy" className="text-decoration-none text-muted">Privacy Policy</a>
              <span className="mx-2">|</span>
              <a href="/terms" className="text-decoration-none text-muted">Terms of Service</a>
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;