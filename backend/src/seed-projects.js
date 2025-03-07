const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Lead = require('./models/Lead');

// Directly define a simple version of Project model to bypass references
const Project = mongoose.model('Project', new mongoose.Schema({
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  contractNumber: { type: String, required: true },
  status: { type: String, default: 'planning' },
  timeline: {
    contractSigned: Date,
    permitSubmitted: Date,
    permitApproved: Date,
    installationStart: Date,
    installationEnd: Date,
    inspectionDate: Date,
    completionDate: Date
  },
  projectManager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  installationTeam: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  equipmentUsed: [{
    type: { type: String },
    manufacturer: String,
    model: String,
    serialNumber: String,
    quantity: Number
  }],
  notes: [{
    text: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true }));

// Load env vars
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://mongodb:27017/erp')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err.message);
    process.exit(1);
  });

const seedProjects = async () => {
  try {
    // Find existing users and customers
    const users = await User.find();
    if (users.length === 0) {
      console.log('No users found. Please run seeder.js first.');
      process.exit(1);
    }
    
    const adminUser = users.find(u => u.role === 'admin') || users[0];
    
    // Create a test customer if none exist
    let customers = await Lead.find();
    if (customers.length === 0) {
      console.log('No customers found. Creating sample customer...');
      
      const newCustomer = await Lead.create({
        name: 'Project Test Customer',
        email: 'project@example.com',
        phone: '555-123-9876',
        address: {
          street: '789 Project Street',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94103',
          country: 'USA',
        },
        source: 'website',
        propertyType: 'commercial',
        status: 'closed_won',
        notes: 'Test customer for project seeding',
        assignedTo: adminUser._id,
      });
      
      customers = [newCustomer];
      console.log('Created test customer');
    }
    
    // Clear existing projects
    await Project.deleteMany();
    console.log('Cleared existing projects');
    
    // Create sample projects
    const projectData = customers.map((customer, index) => ({
      customer: customer._id,
      contractNumber: `TEN${2023 + index}-00${index + 1}`,
      projectManager: adminUser._id,
      timeline: {
        contractSigned: new Date(Date.now() - (90 - index * 15) * 24 * 60 * 60 * 1000),
        permitSubmitted: new Date(Date.now() - (80 - index * 15) * 24 * 60 * 60 * 1000),
        permitApproved: new Date(Date.now() - (60 - index * 15) * 24 * 60 * 60 * 1000),
        installationStart: new Date(Date.now() - (50 - index * 15) * 24 * 60 * 60 * 1000),
        installationEnd: index < 2 ? new Date(Date.now() - (30 - index * 15) * 24 * 60 * 60 * 1000) : null,
        inspectionDate: index < 2 ? new Date(Date.now() - (20 - index * 15) * 24 * 60 * 60 * 1000) : null,
        completionDate: index < 1 ? new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) : null
      },
      status: index === 0 ? 'completed' : index === 1 ? 'inspection' : 'in_progress',
      notes: [{
        text: `Project initiated for ${customer.name}`,
        createdBy: adminUser._id,
        createdAt: new Date(Date.now() - (90 - index * 15) * 24 * 60 * 60 * 1000)
      }],
      installationTeam: [adminUser._id],
      equipmentUsed: [
        {
          type: 'panel',
          manufacturer: 'SolarPro',
          model: 'SP-350W',
          serialNumber: `SP${100000 + index}`,
          quantity: 20 + index * 2
        },
        {
          type: 'inverter',
          manufacturer: 'PowerTech',
          model: 'PT-5000',
          serialNumber: `PT${200000 + index}`,
          quantity: 1
        }
      ]
    }));
    
    const projects = await Project.insertMany(projectData);
    console.log(`Created ${projects.length} sample projects`);
    
    console.log('Projects seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedProjects();
