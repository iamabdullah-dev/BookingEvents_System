const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notification_service_db';

async function checkDatabaseConnection() {
  try {
    console.log(`Attempting to connect to MongoDB at: ${MONGODB_URI}`);
    
    // Connect to MongoDB with a timeout
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000 // 5 seconds timeout
    });
    
    console.log('✅ MongoDB connection successful!');
    console.log('Connection state:', mongoose.connection.readyState);
    
    // Check if the notifications collection exists
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });
    
    // Check if the notifications collection exists
    const notificationsCollection = collections.find(c => c.name === 'notifications');
    if (notificationsCollection) {
      console.log('✅ Notifications collection exists');
      
      // Count documents in the collection
      const count = await mongoose.connection.db.collection('notifications').countDocuments();
      console.log(`Collection contains ${count} documents`);
      
      if (count > 0) {
        // Get a sample document
        const sample = await mongoose.connection.db.collection('notifications').findOne();
        console.log('Sample document:');
        console.log(JSON.stringify(sample, null, 2));
      }
    } else {
      console.log('❌ Notifications collection does not exist');
      console.log('Please run init_db.js to initialize the database');
    }
    
    // Close the connection
    await mongoose.connection.close();
    console.log('Connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    
    // Provide troubleshooting tips
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure MongoDB is running on your machine or the specified host');
    console.log('2. Check that the connection string in your .env file is correct');
    console.log('3. Ensure the database name is correct');
    console.log('4. Verify network connectivity to the MongoDB server');
    
    process.exit(1);
  }
}

// Run the check
checkDatabaseConnection(); 