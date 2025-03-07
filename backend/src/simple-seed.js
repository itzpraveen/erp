
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lead = require('./models/Lead');
const ServiceRequest = require('./models/ServiceRequest');

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/erp')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

const seedData = async () => {
  try {
    // First, create a sample customer if none exist
    let customer = await Lead.findOne();
    if (!customer) {
      customer = await Lead.create({
        name: 'ABC Solar Inc.',
        email: 'contact@abcsolar.example',
        phone: '555-123-4567',
        address: {
          street: '123 Solar Avenue',
          city: 'Solarville',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        source: 'website',
        propertyType: 'commercial',
        status: 'closed_won',
        notes: 'Large commercial client with multiple sites'
      });
      console.log('Created sample customer:', customer.name);
    } else {
      console.log('Using existing customer:', customer.name);
    }

    // Create a sample service request
    const existingRequest = await ServiceRequest.findOne({ title: 'Inverter Error Troubleshooting vq' });
    if (!existingRequest) {
      const serviceRequest = await ServiceRequest.create({
        customer: customer._id,
        requestType: 'repair',
        title: 'Inverter Error Troubleshooting vq',
        description: 'Customer reported error code E-013 on inverter display. System is still generating power but at reduced efficiency.',
        priority: 'critical',
        status: 'assigned',
        scheduledDate: new Date('2025-03-05'),
        estimatedHours: 2,
        warrantyRelated: true
      });
      console.log('Created sample service request:', serviceRequest.title);
    } else {
      console.log('Service request already exists:', existingRequest.title);
    }

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
