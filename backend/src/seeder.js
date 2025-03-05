const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Lead = require('./models/Lead');

// Load env vars
dotenv.config({ path: './backend/.env' });

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Create sample admin user
const createAdminUser = async () => {
  try {
    // Clear existing users
    await User.deleteMany();

    // Use plain password - the model's pre-save hook will hash it
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    });

    const salesUser = await User.create({
      name: 'Sales User',
      email: 'sales@example.com',
      password: 'password123',
      role: 'sales',
    });

    console.log('Admin user created:');
    console.log(`Email: admin@example.com`);
    console.log(`Password: password123`);
    console.log('\nSales user created:');
    console.log(`Email: sales@example.com`);
    console.log(`Password: password123`);

    // Create some sample leads
    await Lead.deleteMany();

    const leads = [
      {
        name: 'John Smith',
        email: 'john@example.com',
        phone: '555-123-4567',
        address: {
          street: '123 Main St',
          city: 'Boston',
          state: 'MA',
          zipCode: '02108',
          country: 'USA',
        },
        source: 'website',
        propertyType: 'residential',
        status: 'new',
        notes: 'Interested in a 10kW system',
        assignedTo: salesUser._id,
      },
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '555-987-6543',
        address: {
          street: '456 Park Ave',
          city: 'New York',
          state: 'NY',
          zipCode: '10022',
          country: 'USA',
        },
        source: 'referral',
        propertyType: 'commercial',
        status: 'qualified',
        notes: 'Owner of a retail shop, needs 25kW system',
        assignedTo: salesUser._id,
      }
    ];

    await Lead.insertMany(leads);
    console.log('\nSample leads created');

    console.log('\nData import completed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Delete all data
const deleteData = async () => {
  try {
    await User.deleteMany();
    await Lead.deleteMany();

    console.log('Data destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Check if command line arg is -d to delete, otherwise import
if (process.argv[2] === '-d') {
  deleteData();
} else {
  createAdminUser();
}