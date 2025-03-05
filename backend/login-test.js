const axios = require('axios');

async function testLogin() {
  try {
    const response = await axios.post('http://localhost:5001/api/users/login', {
      email: 'admin@example.com',
      password: 'password123'
    });
    
    console.log('Login successful!');
    console.log('User data:', response.data);
  } catch (error) {
    console.error('Login failed!');
    console.error('Error:', error.response ? error.response.data : error.message);
  }
}

testLogin();