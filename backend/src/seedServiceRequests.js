
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Lead = require('./models/Lead');
const ServiceRequest = require('./models/ServiceRequest');

// Load env vars
dotenv.config({ path: './backend/.env' });

// Connect to DB
mongoose.connect(process.env.MONGO_URI);

// Create sample service requests
const createServiceRequests = async () => {
  try {
    // Find existing users
    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Please run seeder.js first.');
      process.exit(1);
    }
    
    const adminUser = users.find(u => u.role === 'admin') || users[0];
    
    // Find or create customers (leads)
    let customers = await Lead.find();
    if (customers.length === 0) {
      console.log('No customers found. Creating sample customers...');
      
      const newCustomers = [
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
          status: 'closed_won',
          notes: 'Interested in a 10kW system',
          assignedTo: adminUser._id,
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
          status: 'closed_won',
          notes: 'Owner of a retail shop, needs 25kW system',
          assignedTo: adminUser._id,
        },
        {
          name: 'Tenaga Corporation',
          email: 'info@tenagacorp.com',
          phone: '555-789-0123',
          address: {
            street: '789 Corporate Plaza',
            city: 'Chicago',
            state: 'IL',
            zipCode: '60601',
            country: 'USA',
          },
          source: 'call',
          propertyType: 'industrial',
          status: 'closed_won',
          notes: 'Large industrial client, multiple buildings',
          assignedTo: adminUser._id,
        }
      ];
      
      customers = await Lead.insertMany(newCustomers);
      console.log('Sample customers created');
    }
    
    // Clear existing service requests
    await ServiceRequest.deleteMany();
    
    // Create sample service requests without project references first
    const serviceRequests = [
      {
        customer: customers[0]._id,
        requestType: 'maintenance',
        title: 'Annual System Maintenance',
        description: 'Scheduled annual maintenance for residential 10kW system. Check inverter, panels, and connections.',
        priority: 'medium',
        status: 'completed',
        assignedTo: adminUser._id,
        scheduledDate: new Date('2024-06-15'),
        completionDate: new Date('2024-06-15'),
        estimatedHours: 3,
        actualHours: 2.5,
        notes: [
          {
            text: 'System is performing well, cleaned panels and checked connections.',
            createdBy: adminUser._id,
            createdAt: new Date('2024-06-15'),
          }
        ],
        resolution: {
          description: 'Completed annual maintenance, system is operating at optimal efficiency.',
          date: new Date('2024-06-15'),
          resolvedBy: adminUser._id,
        },
        warrantyRelated: false,
      },
      {
        customer: customers[1]._id,
        requestType: 'repair',
        title: 'Inverter Error Troubleshooting vq',
        description: 'Customer reported error code E-013 on inverter display. System is still generating power but at reduced efficiency.',
        priority: 'critical',
        status: 'assigned',
        assignedTo: adminUser._id,
        scheduledDate: new Date('2025-03-05'),
        estimatedHours: 2,
        notes: [
          {
            text: 'Initial assessment: May need firmware update or possible hardware replacement.',
            createdBy: adminUser._id,
            createdAt: new Date('2025-03-01'),
          }
        ],
        warrantyRelated: true,
      },
      {
        customer: customers[2]._id,
        requestType: 'inspection',
        title: 'Pre-Installation Site Assessment',
        description: 'Assessment needed for potential new system installation. Evaluate roof condition, electrical panel, and optimal panel placement.',
        priority: 'high',
        status: 'scheduled',
        assignedTo: adminUser._id,
        scheduledDate: new Date('2025-03-10'),
        estimatedHours: 4,
        warrantyRelated: false,
      },
      {
        customer: customers[2]._id,
        requestType: 'system_upgrade',
        title: 'Battery Storage Addition',
        description: 'Add 30kWh battery storage system to existing solar installation. Customer wants backup power capability.',
        priority: 'medium',
        status: 'new',
        scheduledDate: new Date('2025-04-15'),
        estimatedHours: 8,
        warrantyRelated: false,
      }
    ];
    
    await ServiceRequest.insertMany(serviceRequests);
    console.log('Sample service requests created');
    
    console.log('\nData import completed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

createServiceRequests();
