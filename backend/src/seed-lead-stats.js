
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

const seedLeadsWithStats = async () => {
  try {
    // Use the existing leads
    const leadCount = await Lead.countDocuments();
    console.log(`Found ${leadCount} existing leads`);

    // Update leads with different statuses and sources for better statistics
    const leads = await Lead.find().limit(5);
    
    if (leads.length >= 5) {
      // Set different statuses
      leads[0].status = 'new';
      leads[1].status = 'contacted';
      leads[2].status = 'qualified';
      leads[3].status = 'proposal';
      leads[4].status = 'closed_won';
      
      // Set different sources
      leads[0].source = 'website';
      leads[1].source = 'referral';
      leads[2].source = 'social_media';
      leads[3].source = 'call';
      leads[4].source = 'email';
      
      // Save all leads
      await Promise.all(leads.map(lead => lead.save()));
      console.log('Updated leads with varied statuses and sources');
    } else {
      console.log('Not enough leads to update stats. Please run the lead seeder first.');
    }

    console.log('Lead stats seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  }
};

seedLeadsWithStats();
