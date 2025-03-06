import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
  return (
    <footer className="mt-5 py-3">
      <Container>
        <Row>
          <Col className="text-center">
            <img 
              src="/tenaga-logo.png" 
              alt="Tenaga" 
              height="30" 
              className="mb-2"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'data:image/svg+xml;charset=UTF-8,%3Csvg width="120" height="30" xmlns="http://www.w3.org/2000/svg"%3E%3Cg%3E%3Crect x="0" y="0" width="30" height="30" rx="0" fill="%23c02c2c"/%3E%3Ctext x="36" y="20" font-family="Arial" font-size="14" font-weight="bold" fill="%23183e34"%3ETENAGA%3C/text%3E%3C/g%3E%3C/svg%3E';
              }}
            />
            <p className="text-muted mb-0 small">
              Copyright &copy; Tenaga {new Date().getFullYear()}. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;