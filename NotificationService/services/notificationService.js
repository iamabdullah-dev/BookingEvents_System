const Notification = require('../models/Notification');
const emailService = require('./emailService');
const smsService = require('./smsService');

/**
 * Process a notification
 * @param {Object} notificationData - The notification data from RabbitMQ
 * @returns {Promise} - Resolves with the processed notification
 */
const processNotification = async (notificationData) => {
  try {
    console.log('Processing notification data:', JSON.stringify(notificationData, null, 2));
    
    // Validate required fields
    const requiredFields = ['booking_id', 'user_id', 'user_email', 'event_id', 'event_name', 'tickets', 'total_price', 'status'];
    const missingFields = requiredFields.filter(field => !notificationData[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    console.log('All required fields present, creating notification document');
    
    // Create a new notification record
    // Pass the entire notification data object to allow for any additional fields
    const notification = new Notification(notificationData);
    
    // Ensure notification_type is set (default is EMAIL)
    if (!notification.notification_type) {
      notification.notification_type = 'EMAIL';
      console.log('Set default notification_type to EMAIL');
    }
    
    console.log('Notification document created, saving to database...');
    console.log('Document to save:', JSON.stringify(notification.toObject(), null, 2));
    
    // Save the notification to the database
    try {
      const savedNotification = await notification.save();
      console.log('✅ Notification saved to database with ID:', savedNotification._id);
      
      // Send the appropriate notification based on status
      if (notification.status === 'CONFIRMED') {
        console.log('Status is CONFIRMED, sending confirmation notification');
        await sendConfirmationNotification(savedNotification);
      } else if (notification.status === 'CANCELLED') {
        console.log('Status is CANCELLED, sending cancellation notification');
        await sendCancellationNotification(savedNotification);
      } else {
        console.log(`Status is ${notification.status}, no notification sent`);
      }
      
      return savedNotification;
    } catch (saveError) {
      console.error('❌ Error saving notification to database:', saveError);
      console.error('Error details:', saveError.message);
      if (saveError.name === 'ValidationError') {
        for (const field in saveError.errors) {
          console.error(`Validation error for field ${field}:`, saveError.errors[field].message);
        }
      }
      throw saveError;
    }
  } catch (error) {
    console.error('Error processing notification:', error);
    throw error;
  }
};

/**
 * Send a confirmation notification
 * @param {Object} notification - The notification object
 * @returns {Promise} - Resolves when the notification is sent
 */
const sendConfirmationNotification = async (notification) => {
  try {
    let result;
    
    if (notification.notification_type === 'EMAIL') {
      result = await emailService.sendBookingConfirmationEmail(notification);
    } else if (notification.notification_type === 'SMS') {
      result = await smsService.sendBookingConfirmationSMS(notification);
    }
    
    // Update the notification record
    notification.sent = true;
    notification.sent_at = new Date();
    await notification.save();
    
    return result;
  } catch (error) {
    console.error('Error sending confirmation notification:', error);
    throw error;
  }
};

/**
 * Send a cancellation notification
 * @param {Object} notification - The notification object
 * @returns {Promise} - Resolves when the notification is sent
 */
const sendCancellationNotification = async (notification) => {
  try {
    let result;
    
    if (notification.notification_type === 'EMAIL') {
      result = await emailService.sendBookingCancellationEmail(notification);
    } else if (notification.notification_type === 'SMS') {
      result = await smsService.sendBookingCancellationSMS(notification);
    }
    
    // Update the notification record
    notification.sent = true;
    notification.sent_at = new Date();
    await notification.save();
    
    return result;
  } catch (error) {
    console.error('Error sending cancellation notification:', error);
    throw error;
  }
};

/**
 * Get all notifications
 * @returns {Promise} - Resolves with all notifications
 */
const getAllNotifications = async () => {
  return Notification.find().sort({ created_at: -1 });
};

/**
 * Get notifications by user ID
 * @param {Number} userId - The user ID
 * @returns {Promise} - Resolves with the user's notifications
 */
const getNotificationsByUserId = async (userId) => {
  return Notification.find({ user_id: userId }).sort({ created_at: -1 });
};

/**
 * Get notifications by booking ID
 * @param {Number} bookingId - The booking ID
 * @returns {Promise} - Resolves with the booking's notifications
 */
const getNotificationsByBookingId = async (bookingId) => {
  return Notification.find({ booking_id: bookingId }).sort({ created_at: -1 });
};

/**
 * Get notifications by status
 * @param {String} status - The notification status
 * @returns {Promise} - Resolves with notifications matching the status
 */
const getNotificationsByStatus = async (status) => {
  return Notification.find({ status }).sort({ created_at: -1 });
};

module.exports = {
  processNotification,
  sendConfirmationNotification,
  sendCancellationNotification,
  getAllNotifications,
  getNotificationsByUserId,
  getNotificationsByBookingId,
  getNotificationsByStatus
}; 