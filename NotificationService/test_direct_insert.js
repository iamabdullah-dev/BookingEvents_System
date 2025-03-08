const mongoose = require('mongoose');
const Notification = require('./models/Notification');
require('dotenv').config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notification_service_db';

// Test data that matches the format from RabbitMQ
const testData = {
  booking_id: 12345,
  user_id: 789,
  user_email: "test@example.com",
  event_id: "event-123",
  event_name: "Test Concert",
  tickets: 2,
  total_price: 150.00,
  status: "CONFIRMED",
  timestamp: new Date().toISOString()
};

async function testDirectInsert() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
    
    console.log('Creating notification document...');
    const notification = new Notification(testData);
    
    console.log('Document to save:', JSON.stringify(notification.toObject(), null, 2));
    
    console.log('Saving to database...');
    const savedNotification = await notification.save();
    
    console.log('✅ Notification saved successfully!');
    console.log('Saved document:', JSON.stringify(savedNotification.toObject(), null, 2));
    
    // Count documents in the collection
    const count = await Notification.countDocuments();
    console.log(`Collection now contains ${count} documents`);
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    
    if (error.name === 'ValidationError') {
      console.error('Validation errors:');
      for (const field in error.errors) {
        console.error(`- ${field}: ${error.errors[field].message}`);
      }
    }
    
    // Try to close the connection if it's open
    try {
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
      }
    } catch (closeError) {
      console.error('Error closing MongoDB connection:', closeError);
    }
    
    process.exit(1);
  }
}

// Run the test
testDirectInsert(); 