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
    
    const conn = await mongoose.connect(process.env.MONGO_URI, options);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;