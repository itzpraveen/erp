const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');

// Create a simple server to test errors
const app = express();
app.use(cors());
app.use(express.json());

// Simple error handler
app.use((err, req, res, next) => {
  console.error('Error caught by middleware:', err);
  res.status(500).json({
    message: 'Internal server error',
    error: err.message,
    stack: err.stack
  });
});

// Start the test server on a different port
const port = 5002;
app.listen(port, () => {
  console.log(`Test server running on port ${port}`);
  runTests();
});

async function runTests() {
  try {
    // Test login endpoint
    console.log('Testing login...');
    const loginResponse = await axios.post('http://localhost:5001/api/users/login', {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    console.log('Login successful!');
    console.log('User data:', loginResponse.data);
    
    // Test authenticated endpoint
    console.log('\nTesting authenticated endpoint...');
    const token = loginResponse.data.token;
    
    const leadResponse = await axios.get('http://localhost:5001/api/leads', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log('Leads fetch successful!');
    console.log(`Retrieved ${leadResponse.data.leads?.length || 0} leads`);
    
    console.log('\nAll tests passed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n=== TEST FAILED ===');
    console.error('Request failed:', error.config?.method, error.config?.url);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    } else {
      console.error('Error:', error.message);
      console.error('Stack:', error.stack);
    }
    
    process.exit(1);
  }
}