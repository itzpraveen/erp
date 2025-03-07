import React from 'react';
import { Spinner } from 'react-bootstrap';

const Loader = ({ size = 'standard', text = 'Loading...', inline = false, className = '' }) => {
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

  return (
    <div style={containerStyle} className={className}>
      <Spinner
        animation="border"
        role="status"
        variant="primary"
        style={{
          ...dimensions,
          opacity: '0.8',
          borderWidth: size === 'small' ? '2px' : '4px'
        }}
      >
        <span className="sr-only">{text}</span>
      </Spinner>
      {text && !inline && (
        <div style={{ marginTop: '10px', textAlign: 'center', color: '#6c757d' }}>
          {text}
        </div>
      )}
    </div>
  );
};

export default Loader;