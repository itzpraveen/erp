
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lead = require('./models/Lead');
const ServiceRequest = require('./models/ServiceRequest');

// Load env vars
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
    // Find all customers (leads)
    const customers = await Lead.find({});
    if (customers.length === 0) {
      console.error('No customers found. Please run seed-customers.js first.');
      process.exit(1);
    }
    console.log(`Found ${customers.length} customers to use for service requests`);

    // Clear existing service requests
    await ServiceRequest.deleteMany({});
    console.log('Cleared existing service requests');

    // Create sample service requests
    const serviceRequests = [
      {
        customer: customers[0]._id,
        requestType: 'maintenance',
        title: 'Annual System Maintenance',
        description: 'Scheduled annual maintenance for residential 10kW system. Check inverter, panels, and connections.',
        priority: 'medium',
        status: 'completed',
        scheduledDate: new Date('2024-06-15'),
        completionDate: new Date('2024-06-15'),
        estimatedHours: 3,
        actualHours: 2.5,
        warrantyRelated: false,
      },
      {
        customer: customers[1]._id,
        requestType: 'repair',
        title: 'Inverter Error Troubleshooting vq',
        description: 'Customer reported error code E-013 on inverter display. System is still generating power but at reduced efficiency.',
        priority: 'critical',
        status: 'assigned',
        scheduledDate: new Date('2025-03-05'),
        estimatedHours: 2,
        warrantyRelated: true,
      },
      {
        customer: customers[2]._id,
        requestType: 'inspection',
        title: 'Pre-Installation Site Assessment',
        description: 'Assessment needed for potential new system installation. Evaluate roof condition, electrical panel, and optimal panel placement.',
        priority: 'high',
        status: 'scheduled',
        scheduledDate: new Date('2025-03-10'),
        estimatedHours: 4,
        warrantyRelated: false,
      },
      {
        customer: customers[3]._id,
        requestType: 'system_upgrade',
        title: 'Battery Storage Addition',
        description: 'Add 30kWh battery storage system to existing solar installation. Customer wants backup power capability.',
        priority: 'medium',
        status: 'new',
        scheduledDate: new Date('2025-04-15'),
        estimatedHours: 8,
        warrantyRelated: false,
      },
      {
        customer: customers[4]._id,
        requestType: 'other',
        title: 'System Performance Review',
        description: 'Customer has requested a review of their system performance. Need to analyze production data and compare with estimates.',
        priority: 'low',
        status: 'new',
        scheduledDate: new Date('2025-03-20'),
        estimatedHours: 1,
        warrantyRelated: false,
      }
    ];

    const createdRequests = await ServiceRequest.insertMany(serviceRequests);
    console.log(`Created ${createdRequests.length} sample service requests`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
