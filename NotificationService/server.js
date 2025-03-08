const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

// Import routes
const notificationRoutes = require('./routes/notifications');

// Import RabbitMQ consumer
const { startConsumer } = require('./rabbitmq/consumer');

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB with improved error handling
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    startServer();
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    // Retry connection after a delay
    console.log('Retrying MongoDB connection in 5 seconds...');
    setTimeout(() => {
      mongoose.connect(process.env.MONGODB_URI)
        .then(() => {
          console.log('MongoDB connected successfully on retry');
          startServer();
        })
        .catch(retryErr => {
          console.error('MongoDB connection retry failed:', retryErr);
          process.exit(1);
        });
    }, 5000);
  });

// Routes
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  // Include MongoDB connection status in health check
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.status(200).json({ 
    status: 'UP',
    database: dbStatus
  });
});

// Function to start the server
function startServer() {
  // Start the server
  app.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
    
    // Start the RabbitMQ consumer
    startConsumer().catch(err => {
      console.error('Failed to start RabbitMQ consumer:', err);
    });
  });
  
  // Handle MongoDB connection errors after initial connection
  mongoose.connection.on('error', err => {
    console.error('MongoDB connection error after initial connection:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected');
  });
  
  mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
  });
  
  // Handle application shutdown
  process.on('SIGINT', async () => {
    try {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    } catch (err) {
      console.error('Error during MongoDB connection close:', err);
      process.exit(1);
    }
  });
} 