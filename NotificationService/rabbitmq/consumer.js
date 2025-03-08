const amqp = require('amqplib');
const notificationService = require('../services/notificationService');
require('dotenv').config();

// RabbitMQ connection details
const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
const queueName = process.env.RABBITMQ_QUEUE || 'booking_notifications';

/**
 * Format the message data to ensure it's compatible with MongoDB schema
 * @param {Object} messageData - The raw message data from RabbitMQ
 * @returns {Object} - The formatted data ready for MongoDB
 */
const formatMessageForMongoDB = (messageData) => {
  // Ensure all required fields are present and have the correct type
  const formattedData = {
    booking_id: parseInt(messageData.booking_id) || 0,
    user_id: parseInt(messageData.user_id) || 0,
    user_email: messageData.user_email || '',
    event_id: messageData.event_id || '',
    event_name: messageData.event_name || '',
    tickets: parseInt(messageData.tickets) || 0,
    total_price: parseFloat(messageData.total_price) || 0,
    status: messageData.status || 'PENDING',
    notification_type: messageData.notification_type || 'EMAIL',
    timestamp: messageData.timestamp || new Date().toISOString(),
    sent: false,
    sent_at: null
  };

  console.log('Formatted message data for MongoDB:', formattedData);
  return formattedData;
};

/**
 * Acknowledge a message to remove it from the queue
 * @param {Object} channel - The RabbitMQ channel
 * @param {Object} msg - The message to acknowledge
 * @param {string} reason - The reason for acknowledgment
 */
const acknowledgeMessage = (channel, msg, reason = 'success') => {
  try {
    channel.ack(msg);
    console.log(`🗑️ Message acknowledged and removed from queue (reason: ${reason})`);
  } catch (error) {
    console.error('Error acknowledging message:', error);
  }
};

/**
 * Start the RabbitMQ consumer
 * @returns {Promise} - Resolves when the consumer is started
 */
const startConsumer = async () => {
  let connection;
  let channel;
  
  try {
    // Connect to RabbitMQ
    console.log(`Connecting to RabbitMQ at ${rabbitmqHost}...`);
    connection = await amqp.connect(`amqp://${rabbitmqHost}`);
    channel = await connection.createChannel();
    
    // Make sure the queue exists
    await channel.assertQueue(queueName, { durable: true });
    
    // Get queue info to see how many messages are in the queue
    const queueInfo = await channel.checkQueue(queueName);
    console.log(`🔍 Connected to queue: ${queueName}`);
    console.log(`📊 Queue stats: ${queueInfo.messageCount} messages, ${queueInfo.consumerCount} consumers`);
    
    // Set prefetch to 1 to ensure we process one message at a time
    channel.prefetch(1);
    
    // Consume messages from the queue
    channel.consume(queueName, async (msg) => {
      if (msg !== null) {
        try {
          console.log('📨 Received message from RabbitMQ');
          console.log(`📝 Message ID: ${msg.properties.messageId || 'N/A'}`);
          
          // Parse the message content
          const rawContent = msg.content.toString();
          console.log('Raw message content:', rawContent);
          
          let content;
          try {
            content = JSON.parse(rawContent);
            console.log('Parsed message content:', content);
          } catch (parseError) {
            console.error('Error parsing message JSON:', parseError);
            // Acknowledge the message to remove it from the queue since it's invalid
            acknowledgeMessage(channel, msg, 'invalid JSON format');
            return;
          }
          
          // Format the message data for MongoDB
          const formattedData = formatMessageForMongoDB(content);
          
          // Process the notification with the formatted data
          const savedNotification = await notificationService.processNotification(formattedData);
          console.log(`💾 Notification saved to MongoDB with ID: ${savedNotification._id}`);
          
          // Acknowledge the message to remove it from the queue
          acknowledgeMessage(channel, msg, 'successfully processed');
          
          // Get updated queue info
          try {
            const updatedQueueInfo = await channel.checkQueue(queueName);
            console.log(`📊 Updated queue stats: ${updatedQueueInfo.messageCount} messages remaining`);
          } catch (queueCheckError) {
            console.error('Error checking queue stats:', queueCheckError);
          }
          
          console.log('✅ Message processed successfully and removed from queue');
        } catch (error) {
          console.error('❌ Error processing message:', error);
          
          // If the channel is still open, reject the message
          // In a production environment, you might want to implement a dead-letter queue
          try {
            if (channel && channel.nack) {
              // Decide whether to requeue based on the error type
              const requeue = error.name !== 'MongoServerError' && error.name !== 'ValidationError';
              
              if (requeue) {
                console.log('⏳ Message requeued for retry');
                channel.nack(msg, false, true);
              } else {
                console.log('❌ Message rejected and not requeued');
                // Still acknowledge to remove from queue, but log the rejection
                acknowledgeMessage(channel, msg, `error: ${error.name}`);
              }
            }
          } catch (nackError) {
            console.error('Error handling message rejection:', nackError);
          }
        }
      }
    });
    
    // Handle connection close
    process.on('SIGINT', async () => {
      console.log('Closing RabbitMQ connection...');
      try {
        if (channel) await channel.close();
        if (connection) await connection.close();
      } catch (err) {
        console.error('Error closing RabbitMQ connection:', err);
      }
      process.exit(0);
    });
    
    // Handle connection errors
    connection.on('error', (err) => {
      console.error('RabbitMQ connection error:', err);
      // Attempt to reconnect after a delay
      setTimeout(() => startConsumer(), 5000);
    });
    
    connection.on('close', () => {
      console.error('RabbitMQ connection closed unexpectedly');
      // Attempt to reconnect after a delay
      setTimeout(() => startConsumer(), 5000);
    });
    
    return { connection, channel };
  } catch (error) {
    console.error('Error starting RabbitMQ consumer:', error);
    
    // Close any open connections
    try {
      if (channel) await channel.close();
      if (connection) await connection.close();
    } catch (closeError) {
      console.error('Error closing RabbitMQ connection after error:', closeError);
    }
    
    // Attempt to reconnect after a delay
    console.log('Attempting to reconnect in 5 seconds...');
    setTimeout(() => startConsumer(), 5000);
    
    throw error;
  }
};

module.exports = { startConsumer }; 