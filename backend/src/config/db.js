const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    };
    
    // Add authentication for production environment
    if (process.env.NODE_ENV === 'production') {
      // If credentials are provided in environment variables, use them
      if (process.env.MONGO_USER && process.env.MONGO_PASSWORD) {
        console.log('Using MongoDB authentication for production');
        options.user = process.env.MONGO_USER;
        options.pass = process.env.MONGO_PASSWORD;
        options.authSource = process.env.MONGO_AUTH_SOURCE || 'admin';
      }
    }

    // Add connection pooling options
    options.maxPoolSize = 10; // Increase for higher load applications
    options.minPoolSize = 5;  // Maintain at least 5 connections
    options.serverSelectionTimeoutMS = 5000; // If can't select a server, timeout after 5s
    options.socketTimeoutMS = 45000; // How long sockets can be idle before timing out
    
    // Connect with retry logic
    const connectWithRetry = async (retries = 5, interval = 5000) => {
      try {
        const conn = await mongoose.connect(process.env.MONGO_URI, options);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Create indexes if needed
        await createIndexes();
        
        return conn;
      } catch (error) {
        if (retries === 0) {
          console.error(`MongoDB connection failed after multiple retries: ${error.message}`);
          process.exit(1);
        }
        
        console.log(`MongoDB connection attempt failed. Retrying in ${interval/1000}s...`);
        setTimeout(() => connectWithRetry(retries - 1, interval), interval);
      }
    };
    
    return await connectWithRetry();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Create indexes for better query performance
const createIndexes = async () => {
  try {
    // Get all models
    const Lead = mongoose.model('Lead');
    const Customer = mongoose.model('Customer');
    const Proposal = mongoose.model('Proposal');
    const Project = mongoose.model('Project');
    const ServiceRequest = mongoose.model('ServiceRequest');
    
    // Create indexes for Lead model (most commonly queried fields)
    await Lead.collection.createIndex({ status: 1 });
    await Lead.collection.createIndex({ source: 1 });
    await Lead.collection.createIndex({ assignedTo: 1 });
    await Lead.collection.createIndex({ createdAt: -1 });
    
    // Create indexes for Customer model
    await Customer.collection.createIndex({ status: 1 });
    await Customer.collection.createIndex({ type: 1 });
    await Customer.collection.createIndex({ name: 1 });
    await Customer.collection.createIndex({ email: 1 }, { unique: true, sparse: true });
    
    // Create indexes for Proposal model
    await Proposal.collection.createIndex({ status: 1 });
    await Proposal.collection.createIndex({ lead: 1 });
    await Proposal.collection.createIndex({ createdAt: -1 });
    
    // Create indexes for Project model
    await Project.collection.createIndex({ status: 1 });
    await Project.collection.createIndex({ customer: 1 });
    await Project.collection.createIndex({ startDate: 1 });
    
    // Create indexes for ServiceRequest model
    await ServiceRequest.collection.createIndex({ status: 1 });
    await ServiceRequest.collection.createIndex({ priority: 1 });
    await ServiceRequest.collection.createIndex({ projectId: 1 });
    await ServiceRequest.collection.createIndex({ customer: 1 });
    
    console.log('Database indexes created or updated');
  } catch (error) {
    console.error('Error creating indexes:', error);
    // Don't exit the process, just log the error
  }
};

module.exports = connectDB;