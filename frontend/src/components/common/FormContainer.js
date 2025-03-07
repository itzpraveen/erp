import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

/**
 * Reusable component for containing form elements
 * Used across multiple pages for consistent layout
 */
const FormContainer = ({ children, className = '', maxWidth = 'md' }) => {
  // Set width based on size prop
  const getMaxWidth = () => {
    switch (maxWidth) {
      case 'sm':
        return '540px';
      case 'md':
        return '720px';
      case 'lg':
        return '960px';
      case 'xl':
        return '1140px';
      default:
        return '720px';
    }
  };

  return (
    <Container>
      <Row className="justify-content-md-center">
        <Col
          xs={12}
          md={maxWidth === 'full' ? 12 : 10} 
          lg={maxWidth === 'full' ? 12 : 8}
          style={{ maxWidth: maxWidth === 'full' ? '100%' : getMaxWidth() }}
          className={`form-container ${className}`}
        >
          {children}
        </Col>
      </Row>
    </Container>
  );
};

export default FormContainer;