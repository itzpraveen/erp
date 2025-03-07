/**
 * This migration script updates existing projects to point to the customer
 * instead of the lead. It creates customers from leads if needed.
 */

const mongoose = require('mongoose');
const Project = require('../models/Project');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
require('dotenv').config();

const migrateLead2Customer = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get all projects
    const projects = await Project.find().populate('customer');
    console.log(`Found ${projects.length} projects to migrate`);

    let updatedCount = 0;

    // Process each project
    for (const project of projects) {
      // Skip if the customer field is already pointing to a Customer model
      try {
        // If we can find a Customer with this ID, it's already a Customer reference
        const existingCustomer = await Customer.findById(project.customer);
        if (existingCustomer) {
          console.log(`Project ${project._id} already has a valid customer reference`);
          continue;
        }
      } catch (err) {
        // If error, it's likely not a valid Customer reference - proceed with migration
      }

      // Try to get the lead from the current customer reference
      try {
        const lead = await Lead.findById(project.customer);
        if (!lead) {
          console.log(`Cannot find lead ${project.customer} for project ${project._id}`);
          continue;
        }

        // Check if a customer with this email already exists
        let customer = await Customer.findOne({ email: lead.email });

        if (!customer) {
          // Create a new customer from lead data
          console.log(`Creating new customer from lead ${lead._id} for project ${project._id}`);

          // Format address if it exists
          let formattedAddress = 'Address not provided';
          if (lead.address) {
            const parts = [];
            if (lead.address.street) parts.push(lead.address.street);
            if (lead.address.city) parts.push(lead.address.city);
            if (lead.address.state) parts.push(lead.address.state);
            if (lead.address.zipCode) parts.push(lead.address.zipCode);
            if (lead.address.country) parts.push(lead.address.country);
            
            if (parts.length > 0) {
              formattedAddress = parts.join(', ');
            }
          }

          customer = await Customer.create({
            name: lead.name,
            email: lead.email,
            phone: lead.phone,
            address: formattedAddress,
            type: lead.propertyType === 'residential' ? 'residential' : 'commercial',
            status: 'active',
            notes: `Converted from lead ID: ${lead._id}\n\n${lead.notes || ''}`,
          });

          // Update lead status to closed_won
          lead.status = 'closed_won';
          await lead.save();
        }

        // Update project to point to the customer
        project.customer = customer._id;
        await project.save();
        updatedCount++;
        console.log(`Updated project ${project._id} to use customer ${customer._id}`);
      } catch (err) {
        console.error(`Error migrating project ${project._id}:`, err);
      }
    }

    console.log(`Migration complete. Updated ${updatedCount} projects.`);
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

// Run the migration
migrateLead2Customer();
