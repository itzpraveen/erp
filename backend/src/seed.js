/**
 * Seed script to create initial demo users
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('./models/User');
const logger = require('./utils/logger');

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/erp', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Create demo users
const createDemoUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    logger.info('Cleared existing users');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123', // The pre-save hook will hash this
      role: 'admin',
      department: 'management',
      active: true,
      permissions: {
        proposal: { create: true, view: true, edit: true, approve: true, finalApprove: true },
        project: { create: true, view: true, edit: true },
        serviceRequest: { create: true, view: true, edit: true, assign: true },
        user: { create: true, view: true, edit: true }
      }
    });

    // Create sales user
    const salesUser = await User.create({
      name: 'Sales Rep',
      email: 'sales@example.com',
      password: 'password123', // The pre-save hook will hash this
      role: 'sales',
      department: 'sales',
      active: true,
      permissions: {
        proposal: { create: true, view: true, edit: true, approve: false, finalApprove: false },
        project: { create: false, view: true, edit: false },
        serviceRequest: { create: true, view: true, edit: false, assign: false },
        user: { create: false, view: false, edit: false }
      }
    });

    // Create technician user
    const techUser = await User.create({
      name: 'Tech Support',
      email: 'tech@example.com',
      password: 'password123', // The pre-save hook will hash this
      role: 'technician',
      department: 'service',
      active: true,
      permissions: {
        proposal: { create: false, view: true, edit: false, approve: false, finalApprove: false },
        project: { create: false, view: true, edit: true },
        serviceRequest: { create: true, view: true, edit: true, assign: false },
        user: { create: false, view: false, edit: false }
      }
    });

    logger.info('Demo users created successfully');
    logger.info(`Created ${await User.countDocuments()} users`);

    return { adminUser, salesUser, techUser };
  } catch (error) {
    logger.error(`Error creating demo users: ${error.message}`);
    throw error;
  }
};

// Main function
const seedDemoData = async () => {
  try {
    // Connect to database
    await connectDB();

    // Create users
    const users = await createDemoUsers();
    logger.info('Database seeding completed successfully');

    // Disconnect from the database
    await mongoose.disconnect();
    logger.info('Disconnected from database');

    return users;
  } catch (error) {
    logger.error(`Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

// Execute seeding if this file is run directly
if (require.main === module) {
  seedDemoData()
    .then(() => {
      logger.info('Seed script completed');
      process.exit(0);
    })
    .catch((error) => {
      logger.error(`Seed script failed: ${error.message}`);
      process.exit(1);
    });
}

module.exports = seedDemoData;