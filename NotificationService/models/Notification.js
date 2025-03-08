const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  booking_id: {
    type: Number,
    required: true,
    default: 0
  },
  user_id: {
    type: Number,
    required: true,
    default: 0
  },
  user_email: {
    type: String,
    required: true,
    default: ''
  },
  event_id: {
    type: String,
    required: true,
    default: ''
  },
  event_name: {
    type: String,
    required: true,
    default: ''
  },
  tickets: {
    type: Number,
    required: true,
    default: 0
  },
  total_price: {
    type: Number,
    required: true,
    default: 0
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
    type: Date,
    default: null
  },
  timestamp: {
    type: String,
    default: () => new Date().toISOString()
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, { 
  // This option allows fields not specified in the schema
  strict: false,
  // This option automatically converts string numbers to actual numbers
  // and handles other type conversions
  typePojoToMixed: false
});

// Add a pre-save hook to ensure data is properly formatted
notificationSchema.pre('save', function(next) {
  // Ensure booking_id is a number
  if (typeof this.booking_id === 'string') {
    this.booking_id = parseInt(this.booking_id) || 0;
  }
  
  // Ensure user_id is a number
  if (typeof this.user_id === 'string') {
    this.user_id = parseInt(this.user_id) || 0;
  }
  
  // Ensure tickets is a number
  if (typeof this.tickets === 'string') {
    this.tickets = parseInt(this.tickets) || 0;
  }
  
  // Ensure total_price is a number
  if (typeof this.total_price === 'string') {
    this.total_price = parseFloat(this.total_price) || 0;
  }
  
  // Set timestamp if not provided
  if (!this.timestamp) {
    this.timestamp = new Date().toISOString();
  }
  
  next();
});

module.exports = mongoose.model('Notification', notificationSchema); 