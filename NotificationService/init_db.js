const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/notification_service_db';

// Define the notification schema
const notificationSchema = new mongoose.Schema({
  booking_id: {
    type: Number,
    required: true
  },
  user_id: {
    type: Number,
    required: true
  },
  user_email: {
    type: String,
    required: true
  },
  event_id: {
    type: String,
    required: true
  },
  event_name: {
    type: String,
    required: true
  },
  tickets: {
    type: Number,
    required: true
  },
  total_price: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'CANCELLED'],
    default: 'PENDING'
  },
  notification_type: {
    type: String,
    enum: ['EMAIL', 'SMS'],
    default: 'EMAIL'
  },
  sent: {
    type: Boolean,
    default: false
  },
  sent_at: {
    type: Date
  },
  timestamp: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { 
  strict: false
});

// Create the model
const Notification = mongoose.model('Notification', notificationSchema);

// Function to initialize the database
async function initializeDatabase() {
  try {
    // Connect to MongoDB - wait for the connection to be established
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected successfully');
    
    // Check if the collection exists
    const collections = await mongoose.connection.db.listCollections({ name: 'notifications' }).toArray();
    
    if (collections.length > 0) {
      console.log('Dropping existing notifications collection...');
      await mongoose.connection.db.dropCollection('notifications');
      console.log('Collection dropped successfully');
    } else {
      console.log('Collection does not exist yet, creating new one');
    }
    
    console.log('Creating notifications collection...');
    
    // Create a sample notification to initialize the collection
    const sampleNotification = new Notification({
      booking_id: 1,
      user_id: 1,
      user_email: 'sample@example.com',
      event_id: 'sample-event',
      event_name: 'Sample Event',
      tickets: 1,
      total_price: 100.00,
      status: 'CONFIRMED',
      notification_type: 'EMAIL',
      sent: true,
      sent_at: new Date(),
      timestamp: new Date().toISOString()
    });
    
    await sampleNotification.save();
    console.log('Sample notification created:', sampleNotification);
    
    console.log('Database initialization complete');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    process.exit(0);
  } catch (error) {
    console.error('Error initializing database:', error);
    
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

// Run the initialization
initializeDatabase(); 