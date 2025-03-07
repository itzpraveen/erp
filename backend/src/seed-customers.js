
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Lead = require('./models/Lead');

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
    // Clear existing leads
    await Lead.deleteMany({});
    console.log('Cleared existing leads');

    // Create sample customers
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
        status: 'closed_won',
        notes: 'Interested in a 10kW system',
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
      },
      {
        name: 'Green Energy Solutions',
        email: 'contact@greenenergy.com',
        phone: '555-234-5678',
        address: {
          street: '567 Eco Drive',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94107',
          country: 'USA',
        },
        source: 'email',
        propertyType: 'commercial',
        status: 'qualified',
        notes: 'Interested in commercial solar installations for multiple office buildings',
      },
      {
        name: 'Residential Customer',
        email: 'resident@example.com',
        phone: '555-345-6789',
        address: {
          street: '789 Homeowner Lane',
          city: 'Austin',
          state: 'TX',
          zipCode: '78701',
          country: 'USA',
        },
        source: 'website',
        propertyType: 'residential',
        status: 'new',
        notes: 'New home owner looking for solar options',
      }
    ];

    const createdLeads = await Lead.insertMany(leads);
    console.log(`Created ${createdLeads.length} sample customers`);

    console.log('Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
