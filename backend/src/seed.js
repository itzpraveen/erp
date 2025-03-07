const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to DB using environment variables
const seedDatabase = async () => {
  try {
    console.log('Checking for initial admin user...');
    
    // Check if admin user already exists
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (adminExists) {
      console.log('Admin user already exists, skipping seeding');
      return;
    }
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });
    
    // Create sales user
    const salesUser = await User.create({
      name: 'Sales User',
      email: 'sales@example.com',
      password: 'password123',
      role: 'sales',
    });
    
    console.log('Demo users created successfully');
    console.log('Admin email: admin@example.com');
    console.log('Admin password: password123');
    console.log('Sales email: sales@example.com');
    console.log('Sales password: password123');
    
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};

module.exports = seedDatabase;
