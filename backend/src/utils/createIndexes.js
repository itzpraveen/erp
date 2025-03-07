const mongoose = require('mongoose');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Project = require('../models/Project');
const Proposal = require('../models/Proposal');
const ServiceRequest = require('../models/ServiceRequest');
const User = require('../models/User');
const logger = require('./logger');

/**
 * Create database indexes to improve query performance
 */
const createIndexes = async () => {
  logger.info('Creating database indexes...');
  
  try {
    // Create indexes for Customer model
    await Customer.collection.createIndexes([
      { key: { email: 1 }, unique: true, background: true },
      { key: { name: 1 }, background: true },
      { key: { status: 1 }, background: true },
      { key: { type: 1 }, background: true },
      { key: { createdAt: -1 }, background: true }
    ]);
    logger.info('Created indexes for Customer collection');
    
    // Create indexes for Lead model
    await Lead.collection.createIndexes([
      { key: { email: 1 }, background: true },
      { key: { name: 1 }, background: true },
      { key: { status: 1 }, background: true },
      { key: { source: 1 }, background: true },
      { key: { assignedTo: 1 }, background: true },
      { key: { customer: 1 }, background: true },
      { key: { createdAt: -1 }, background: true },
      { key: { followUpDate: 1 }, background: true }
    ]);
    logger.info('Created indexes for Lead collection');
    
    // Create indexes for Project model
    await Project.collection.createIndexes([
      { key: { customer: 1 }, background: true },
      { key: { status: 1 }, background: true },
      { key: { startDate: 1 }, background: true },
      { key: { endDate: 1 }, background: true },
      { key: { createdAt: -1 }, background: true }
    ]);
    logger.info('Created indexes for Project collection');
    
    // Create indexes for Proposal model
    await Proposal.collection.createIndexes([
      { key: { customer: 1 }, background: true },
      { key: { lead: 1 }, background: true },
      { key: { status: 1 }, background: true },
      { key: { proposalDate: 1 }, background: true },
      { key: { expiryDate: 1 }, background: true },
      { key: { createdAt: -1 }, background: true }
    ]);
    logger.info('Created indexes for Proposal collection');
    
    // Create indexes for ServiceRequest model
    await ServiceRequest.collection.createIndexes([
      { key: { customer: 1 }, background: true },
      { key: { project: 1 }, background: true },
      { key: { status: 1 }, background: true },
      { key: { priority: 1 }, background: true },
      { key: { createdAt: -1 }, background: true },
      { key: { scheduledDate: 1 }, background: true }
    ]);
    logger.info('Created indexes for ServiceRequest collection');
    
    // Create indexes for User model
    await User.collection.createIndexes([
      { key: { email: 1 }, unique: true, background: true },
      { key: { role: 1 }, background: true },
      { key: { status: 1 }, background: true },
      { key: { createdAt: -1 }, background: true }
    ]);
    logger.info('Created indexes for User collection');
    
    logger.info('All database indexes created successfully');
    return true;
  } catch (error) {
    logger.error('Error creating database indexes:', error);
    return false;
  }
};

module.exports = createIndexes;
