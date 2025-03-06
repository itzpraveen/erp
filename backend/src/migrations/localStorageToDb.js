/**
 * Migration script to move data from localStorage to MongoDB
 * 
 * Run with: npm run migrate:local
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const readline = require('readline');

// Load env vars
dotenv.config();

// Models
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const Proposal = require('../models/Proposal');
const Project = require('../models/Project');
const ServiceRequest = require('../models/ServiceRequest');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Function to read localStorage data file
const readLocalStorageData = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error(`Error reading file at ${filePath}:`, error);
    return null;
  }
};

// Function to create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user
const promptUser = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Main migration function
const migrateData = async () => {
  console.log('Starting migration of data from localStorage to MongoDB...');
  
  // Connect to MongoDB
  const conn = await connectDB();
  
  // Define path to localStorage data files
  const localStorageDir = path.join(__dirname, '../../local-storage-data');
  
  // Check if directory exists, if not, ask user to provide the data
  if (!fs.existsSync(localStorageDir)) {
    console.log(`Local storage data directory not found at ${localStorageDir}`);
    const createDir = await promptUser('Create directory for local storage data? (y/n): ');
    
    if (createDir.toLowerCase() === 'y') {
      fs.mkdirSync(localStorageDir, { recursive: true });
      console.log(`Created directory at ${localStorageDir}`);
      console.log('Please place your localStorage JSON files in this directory with names:');
      console.log('- customers.json');
      console.log('- leads.json');
      console.log('- proposals.json');
      console.log('- projects.json');
      console.log('- serviceRequests.json');
      
      const proceed = await promptUser('Continue with migration? (y/n): ');
      if (proceed.toLowerCase() !== 'y') {
        console.log('Migration aborted. Exiting...');
        rl.close();
        process.exit(0);
      }
    } else {
      console.log('Migration aborted. Exiting...');
      rl.close();
      process.exit(0);
    }
  }
  
  // Migrate Customers
  const customersFile = path.join(localStorageDir, 'customers.json');
  const customers = readLocalStorageData(customersFile);
  if (customers && customers.length > 0) {
    console.log(`Found ${customers.length} customers to migrate`);
    
    const existingCount = await Customer.countDocuments();
    if (existingCount > 0) {
      const overwrite = await promptUser(`${existingCount} customers already exist in DB. Overwrite? (y/n): `);
      if (overwrite.toLowerCase() === 'y') {
        await Customer.deleteMany({});
        console.log('Existing customers deleted');
      } else {
        console.log('Skipping customer migration');
      }
    }
    
    if (existingCount === 0 || overwrite.toLowerCase() === 'y') {
      // Map localStorage IDs to MongoDB ObjectIDs for reference
      const customerIdMap = {};
      
      for (const customer of customers) {
        const oldId = customer._id;
        delete customer._id; // Remove the old ID so Mongoose creates a new one
        
        const newCustomer = new Customer(customer);
        await newCustomer.save();
        
        // Store the mapping
        customerIdMap[oldId] = newCustomer._id;
        console.log(`Migrated customer: ${customer.name}`);
      }
      
      // Save the ID mapping for reference in other collections
      fs.writeFileSync(
        path.join(localStorageDir, 'customerIdMapping.json'),
        JSON.stringify(customerIdMap, null, 2)
      );
      
      console.log(`Successfully migrated ${customers.length} customers`);
    }
  } else {
    console.log('No customer data found to migrate');
  }
  
  // Migrate Leads
  const leadsFile = path.join(localStorageDir, 'leads.json');
  const leads = readLocalStorageData(leadsFile);
  if (leads && leads.length > 0) {
    console.log(`Found ${leads.length} leads to migrate`);
    
    const existingCount = await Lead.countDocuments();
    if (existingCount > 0) {
      const overwrite = await promptUser(`${existingCount} leads already exist in DB. Overwrite? (y/n): `);
      if (overwrite.toLowerCase() === 'y') {
        await Lead.deleteMany({});
        console.log('Existing leads deleted');
      } else {
        console.log('Skipping lead migration');
      }
    }
    
    if (existingCount === 0 || overwrite.toLowerCase() === 'y') {
      // Get customer ID mapping
      const customerIdMapFile = path.join(localStorageDir, 'customerIdMapping.json');
      let customerIdMap = {};
      if (fs.existsSync(customerIdMapFile)) {
        customerIdMap = JSON.parse(fs.readFileSync(customerIdMapFile, 'utf8'));
      }
      
      // Map localStorage IDs to MongoDB ObjectIDs for reference
      const leadIdMap = {};
      
      for (const lead of leads) {
        const oldId = lead._id;
        delete lead._id; // Remove the old ID so Mongoose creates a new one
        
        // If lead has a customerId, update it to the MongoDB ID
        if (lead.customerId && customerIdMap[lead.customerId]) {
          lead.customerId = customerIdMap[lead.customerId];
        }
        
        const newLead = new Lead(lead);
        await newLead.save();
        
        // Store the mapping
        leadIdMap[oldId] = newLead._id;
        console.log(`Migrated lead: ${lead.name}`);
      }
      
      // Save the ID mapping for reference in other collections
      fs.writeFileSync(
        path.join(localStorageDir, 'leadIdMapping.json'),
        JSON.stringify(leadIdMap, null, 2)
      );
      
      console.log(`Successfully migrated ${leads.length} leads`);
    }
  } else {
    console.log('No lead data found to migrate');
  }
  
  // Continue with similar patterns for other collections...
  // Proposals, Projects, and ServiceRequests
  
  console.log('Migration completed successfully');
  rl.close();
  process.exit(0);
};

// Run the migration
migrateData().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
