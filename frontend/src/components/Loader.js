import React from 'react';
import { Card, Container, Row, Col } from 'react-bootstrap';

const Loader = ({ type = 'spinner', size = 'standard', text = 'Loading...', inline = false, className = '' }) => {
  // Define dimensions based on size prop
  let dimensions = {
    small: { width: '25px', height: '25px' },
    standard: { width: '50px', height: '50px' },
    large: { width: '100px', height: '100px' }
  }[size] || { width: '50px', height: '50px' };

  // Styling based on inline prop
  const containerStyle = inline
    ? { display: 'inline-block', marginRight: '10px', verticalAlign: 'middle' }
    : { display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' };

  // Skeleton placeholder with pulsating effect
  if (type === 'skeleton') {
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
        <style jsx="true">{`
          .skeleton-loader {
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 20px;
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
  }

  // Content placeholder loader
  if (type === 'content') {
    return (
      <div className={`content-loader ${className}`} style={containerStyle}>
        <div className="loading-content">
          <div className="loading-item"></div>
          <div className="loading-item"></div>
          <div className="loading-item"></div>
          <div className="loading-item"></div>
        </div>
        {text && !inline && <div className="loading-text">{text}</div>}
        <style jsx="true">{`
          .content-loader {
            width: 100%;
            max-width: 500px;
          }
          .loading-content {
            background-color: white;
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .loading-item {
            height: 20px;
            margin-bottom: 15px;
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: loading 1.5s infinite;
            border-radius: 4px;
          }
          .loading-item:last-child {
            margin-bottom: 0;
            width: 80%;
          }
          .loading-text {
            margin-top: 15px;
            text-align: center;
            color: #6c757d;
            font-size: 14px;
          }
          @keyframes loading {
            to {
              background-position: -200% 0;
            }
          }
        `}</style>
      </div>
    );
  }

  // Default spinner (for backward compatibility)
  return (
    <div style={containerStyle} className={className}>
      <div className="progress-loader" style={dimensions}>
        <svg className="circular" viewBox="25 25 50 50">
          <circle className="path" cx="50" cy="50" r="20" fill="none" strokeWidth="4" strokeMiterlimit="10"/>
        </svg>
      </div>
      {text && !inline && (
        <div style={{ marginTop: '10px', textAlign: 'center', color: '#6c757d' }}>
          {text}
        </div>
      )}
      <style jsx="true">{`
        .progress-loader {
          position: relative;
        }
        .circular {
          animation: rotate 2s linear infinite;
          height: 100%;
          transform-origin: center center;
          width: 100%;
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          margin: auto;
        }
        .path {
          stroke-dasharray: 1, 200;
          stroke-dashoffset: 0;
          animation: dash 1.5s ease-in-out infinite, color 6s ease-in-out infinite;
          stroke-linecap: round;
          stroke: #007bff;
        }
        @keyframes rotate {
          100% {
            transform: rotate(360deg);
          }
        }
        @keyframes dash {
          0% {
            stroke-dasharray: 1, 200;
            stroke-dashoffset: 0;
          }
          50% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -35px;
          }
          100% {
            stroke-dasharray: 89, 200;
            stroke-dashoffset: -124px;
          }
        }
      `}</style>
    </div>
  );
};

export default Loader;