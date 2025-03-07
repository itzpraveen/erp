import React, { Component } from 'react';
import { Container, Alert, Button, Card } from 'react-bootstrap';

/**
 * Error Boundary component to catch and handle errors in components
 * Prevents the entire app from crashing when individual components fail
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  // Allow the user to try again by resetting the error state
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when a component error occurs
      return (
        <Container className="py-4">
          <Card className="shadow-sm">
            <Card.Body>
              <Card.Title className="text-danger">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Something went wrong
              </Card.Title>
              
              <Alert variant="danger">
                <p>We're sorry, but an error occurred while rendering this component.</p>
                <hr />
                <p className="mb-0">
                  <strong>Error:</strong> {this.state.error && this.state.error.toString()}
                </p>
              </Alert>
              
              {process.env.NODE_ENV !== 'production' && this.state.errorInfo && (
                <details className="mt-3 mb-3 bg-light p-3 rounded">
                  <summary className="text-secondary mb-2">Technical Details</summary>
                  <pre className="text-muted small overflow-auto" style={{ maxHeight: '200px' }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}
              
              <div className="d-flex justify-content-between mt-3">
                <Button variant="outline-secondary" onClick={() => window.location.href = '/'}>
                  <i className="fas fa-home me-1"></i> Go to Home
                </Button>
                <Button variant="primary" onClick={this.handleReset}>
                  <i className="fas fa-redo me-1"></i> Try Again
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      );
    }

    // When there's no error, render children normally
    return this.props.children; 
  }
}

export default ErrorBoundary;
