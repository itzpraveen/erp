/**
 * Migration script to update customer addresses from string format to object format
 * Run this script after updating the Customer model
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Customer = require('./models/Customer');

const migrateAddresses = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    // Find all customers with string addresses
    const customers = await Customer.find({}).lean();
    
    console.log(`Found ${customers.length} customers to check for address migration`);
    
    let migratedCount = 0;

    // Process each customer
    for (const customer of customers) {
      // Skip if address is already an object with proper structure
      if (customer.address && typeof customer.address === 'object' && customer.address.street) {
        continue;
      }
      
      // If address is a string, convert it to object
      if (customer.address && typeof customer.address === 'string') {
        // Simple heuristic migration - assume address is in a common format
        // In a real-world scenario, you would need a more sophisticated parsing
        const addressParts = customer.address.split(',').map(part => part.trim());
        
        const addressObject = {
          street: addressParts[0] || '',
          city: addressParts.length > 1 ? addressParts[1] : '',
          state: addressParts.length > 2 ? addressParts[2] : '',
          zipCode: addressParts.length > 3 ? addressParts[3] : '',
          country: addressParts.length > 4 ? addressParts[4] : 'India', // Default country
        };
        
        // Update the customer with the new address structure
        await Customer.updateOne(
          { _id: customer._id },
          { $set: { address: addressObject } }
        );
        
        migratedCount++;
        console.log(`Migrated address for customer: ${customer.name}`);
      }
    }
    
    console.log(`Migration completed. Migrated ${migratedCount} customer addresses.`);
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error(`Error during migration: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run the migration if this script is executed directly
if (require.main === module) {
  migrateAddresses();
}

module.exports = migrateAddresses;