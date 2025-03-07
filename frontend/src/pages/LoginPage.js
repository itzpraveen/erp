import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Alert, Card } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
// Removed unused import
import api from '../utils/api';
import Message from '../components/Message';
import Loader from '../components/Loader';
import FormContainer from '../components/FormContainer';
import { login, reset } from '../features/auth/authSlice';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [backendStatus, setBackendStatus] = useState({ checking: true, online: false });

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { userInfo, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // Check if backend is online
  useEffect(() => {
    const checkBackendStatus = async () => {
      try {
        await api.get('/');
        setBackendStatus({ checking: false, online: true });
      } catch (error) {
        console.error('Backend check failed:', error);
        if (error.code === 'ERR_NETWORK') {
          setBackendStatus({ checking: false, online: false });
        } else {
          // If we get any response, even an error, the backend is running
          setBackendStatus({ checking: false, online: true });
        }
      }
    };

    checkBackendStatus();
  }, []);

  useEffect(() => {
    if (isSuccess || userInfo) {
      navigate('/dashboard');
    }

    return () => {
      dispatch(reset());
    };
  }, [userInfo, isSuccess, navigate, dispatch]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLocalError('');
    
    if (!backendStatus.online) {
      setLocalError('Backend server is not running. Please start the backend server.');
      return;
    }
    
    if (!email || !password) {
      setLocalError('Please enter both email and password');
      return;
    }
    
    try {
      await dispatch(login({ email, password })).unwrap();
      console.log('Login successful, navigating to dashboard');
    } catch (err) {
      console.error('Login failed in component handler:', err);
      if (err.code === 'ERR_NETWORK') {
        setLocalError('Network error: Unable to connect to the server. Please check your network connection and make sure the backend server is running.');
      } else {
        setLocalError(err.message || 'Login failed. Please check your credentials.');
      }
    }
  };

  const manualLogin = async () => {
    try {
      const response = await api.post('/api/users/login', {
        email,
        password
      });
      
      console.log('Manual login response:', response.data);
      localStorage.setItem('userInfo', JSON.stringify(response.data));
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Manual login error:', error);
      setLocalError(error.response?.data?.message || error.message);
    }
  };

  return (
    <FormContainer>
      <h1>Sign In</h1>
      
      {!backendStatus.online && !backendStatus.checking && (
        <Alert variant="danger">
          <Alert.Heading>Backend Server Not Running</Alert.Heading>
          <p>
            The backend server appears to be offline. Please start the backend server with:
          </p>
          <pre className="bg-dark text-white p-2">
            docker-compose restart erp-backend
          </pre>
          <p className="mb-0">Then refresh this page and try again.</p>
        </Alert>
      )}
      
      {backendStatus.checking && <Alert variant="info">Checking backend connection...</Alert>}
      
      {isError && <Message variant="danger">{message}</Message>}
      {localError && <Alert variant="danger">{localError}</Alert>}
      {isLoading && <Loader />}
      
      <Card className="mb-4">
        <Card.Body>
          <Form onSubmit={submitHandler}>
            <Form.Group controlId="email" className="my-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Form.Group controlId="password" className="my-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              ></Form.Control>
            </Form.Group>

            <Button 
              type="submit" 
              variant="primary" 
              className="mt-3 w-100" 
              disabled={isLoading || !backendStatus.online}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
            
            {backendStatus.online && (
              <Button 
                variant="outline-secondary" 
                className="mt-2 w-100" 
                onClick={manualLogin}
                disabled={isLoading}
              >
                Try Alternative Login Method
              </Button>
            )}
          </Form>
        </Card.Body>
      </Card>
      
      <Card className="bg-light">
        <Card.Body>
          <Card.Title>Demo Credentials</Card.Title>
          <Card.Text>
            <strong>Admin User:</strong><br />
            Email: admin@example.com<br />
            Password: password123
          </Card.Text>
          <Card.Text className="mb-0">
            <strong>Sales User:</strong><br />
            Email: sales@example.com<br />
            Password: password123
          </Card.Text>
        </Card.Body>
      </Card>
    </FormContainer>
  );
};

export default LoginPage;