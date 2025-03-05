
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    active: true,
  },
  {
    name: 'Sales User',
    email: 'sales@example.com',
    password: 'password123',
    role: 'sales',
    active: true,
  },
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log('MongoDB Connected');
    try {
      // Clear existing users
      await User.deleteMany({});
      console.log('Users cleared');
      
      // Create new users
      const createdUsers = await User.create(users);
      console.log('Users created:', createdUsers.map(user => user.email));
      
      mongoose.disconnect();
      console.log('Done');
      process.exit(0);
    } catch (error) {
      console.error('Error:', error);
      mongoose.disconnect();
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
