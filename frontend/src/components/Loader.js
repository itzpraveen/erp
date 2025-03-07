import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';

const Loader = ({ text = 'Loading...', className = '' }) => {
  return (
    <Container className={className} style={{ padding: '20px' }}>
      <Row>
        <Col>
          <Card className="skeleton-loader">
            <Card.Body>
              <div className="skeleton-header pulse"></div>
              <div className="skeleton-text pulse"></div>
              <div className="skeleton-text pulse"></div>
              <div className="skeleton-text pulse" style={{ width: '75%' }}></div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {text && (
        <div style={{ textAlign: 'center', color: '#6c757d', marginTop: '10px' }}>
          {text}
        </div>
      )}
      <style jsx="true">{`
        .skeleton-loader {
          border-radius: 8px;
          overflow: hidden;
          margin-bottom: 20px;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }
        .skeleton-header {
          height: 35px;
          background-color: #e9ecef;
          margin-bottom: 15px;
          border-radius: 4px;
        }
        .skeleton-text {
          height: 15px;
          background-color: #e9ecef;
          margin-bottom: 10px;
          border-radius: 4px;
        }
        .pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </Container>
  );
};

export default Loader;