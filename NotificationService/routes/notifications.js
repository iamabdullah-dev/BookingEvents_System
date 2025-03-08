const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const mongoose = require('mongoose');

// Middleware to check MongoDB connection
const checkDbConnection = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      message: 'Database connection unavailable',
      status: 'error'
    });
  }
  next();
};

// Apply the middleware to all routes
router.use(checkDbConnection);

// Get all notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await notificationService.getAllNotifications();
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      status: 'error'
    });
  }
});

// Get notifications by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ 
        message: 'Invalid user ID',
        status: 'error'
      });
    }
    
    const notifications = await notificationService.getNotificationsByUserId(userId);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      status: 'error'
    });
  }
});

// Get notifications by booking ID
router.get('/booking/:bookingId', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.bookingId);
    
    if (isNaN(bookingId)) {
      return res.status(400).json({ 
        message: 'Invalid booking ID',
        status: 'error'
      });
    }
    
    const notifications = await notificationService.getNotificationsByBookingId(bookingId);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching booking notifications:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      status: 'error'
    });
  }
});

// Get notifications by status
router.get('/status/:status', async (req, res) => {
  try {
    const status = req.params.status.toUpperCase();
    
    if (!['PENDING', 'CONFIRMED', 'CANCELLED'].includes(status)) {
      return res.status(400).json({ 
        message: 'Invalid status',
        status: 'error'
      });
    }
    
    const notifications = await notificationService.getNotificationsByStatus(status);
    
    // Enhanced response with more information
    res.json({
      status: 'success',
      count: notifications.length,
      status_type: status,
      notifications: notifications,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching notifications by status:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      status: 'error'
    });
  }
});

// Get latest PENDING notifications with limit
router.get('/pending', async (req, res) => {
  try {
    // Get limit from query parameter or default to 10
    const limit = parseInt(req.query.limit) || 10;
    
    // Get notifications with PENDING status, sorted by creation date (newest first)
    const notifications = await notificationService.getNotificationsByStatus('PENDING');
    
    // Limit the number of notifications returned
    const limitedNotifications = notifications.slice(0, limit);
    
    // Enhanced response with more information
    res.json({
      status: 'success',
      count: limitedNotifications.length,
      total_pending: notifications.length,
      limit: limit,
      notifications: limitedNotifications,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching pending notifications:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      status: 'error'
    });
  }
});

// Create a test notification (for testing purposes)
router.post('/test', async (req, res) => {
  try {
    const { user_id, user_email, event_id, event_name, tickets, total_price, status } = req.body;
    
    // Validate required fields
    if (!user_id || !user_email || !event_id || !event_name || !tickets || !total_price || !status) {
      return res.status(400).json({ 
        message: 'Missing required fields',
        status: 'error'
      });
    }
    
    // Create a test notification
    const notificationData = {
      booking_id: Math.floor(Math.random() * 10000), // Generate a random booking ID
      user_id,
      user_email,
      event_id,
      event_name,
      tickets,
      total_price,
      status,
      timestamp: new Date().toISOString()
    };
    
    const notification = await notificationService.processNotification(notificationData);
    res.status(201).json({
      message: 'Test notification created successfully',
      notification,
      status: 'success'
    });
  } catch (error) {
    console.error('Error creating test notification:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message,
      status: 'error'
    });
  }
});

module.exports = router; 