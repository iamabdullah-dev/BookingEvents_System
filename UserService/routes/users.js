const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const router = express.Router();
const auth = require('../middleware/auth');

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'user_service_db',
  password: process.env.DB_PASSWORD || 'postgres',
  port: process.env.DB_PORT || 5432,
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, username, email, full_name, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(userResult.rows[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all events (communicates with Event Service)
router.get('/events', auth, async (req, res) => {
  try {
    const response = await axios.get('http://localhost:8080/api/events');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// Create a booking (communicates with Booking Service)
router.post('/bookings', auth, async (req, res) => {
  try {
    const { event_id, tickets } = req.body;
    
    const bookingData = {
      user_id: req.user.id,
      event_id,
      tickets
    };
    
    const response = await axios.post('http://localhost:5000/api/bookings', bookingData);
    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Error creating booking' });
  }
});

// Get user's bookings
router.get('/bookings', auth, async (req, res) => {
  try {
    const response = await axios.get(`http://localhost:5000/api/bookings/user/${req.user.id}`);
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});

module.exports = router;
