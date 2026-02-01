const axios = require('axios');

async function testEmail() {
  try {
    const response = await axios.post('http://localhost:3000/users/register', {
      name: 'Test',
      firstname: 'User', 
      email: 'test@example.com',
      password: 'TestPassword123!'
    });
    console.log('Success:', response.data);
  } catch (error) {
    console.log('Error:', error.response?.data || error.message);
  }
}

testEmail();
