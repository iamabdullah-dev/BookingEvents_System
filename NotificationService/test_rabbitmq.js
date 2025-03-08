const amqp = require('amqplib');
require('dotenv').config();

// RabbitMQ connection details
const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
const queueName = process.env.RABBITMQ_QUEUE || 'booking_notifications';

// Generate a test message with a unique ID
const generateTestMessage = (id) => ({
  booking_id: 12345 + id,
  user_id: 789,
  user_email: `test${id}@example.com`,
  event_id: `event-${123 + id}`,
  event_name: `Test Concert ${id}`,
  tickets: 2,
  total_price: 150.00,
  status: "CONFIRMED",
  timestamp: new Date().toISOString()
});

/**
 * Publish multiple test messages to RabbitMQ
 * @param {number} count - Number of messages to publish
 */
async function publishTestMessages(count = 3) {
  let connection;
  let channel;
  
  try {
    console.log(`Connecting to RabbitMQ at ${rabbitmqHost}...`);
    connection = await amqp.connect(`amqp://${rabbitmqHost}`);
    channel = await connection.createChannel();
    
    console.log(`Asserting queue: ${queueName}`);
    await channel.assertQueue(queueName, { durable: true });
    
    // Get queue info before publishing
    const queueInfoBefore = await channel.checkQueue(queueName);
    console.log(`Queue stats before: ${queueInfoBefore.messageCount} messages in queue`);
    
    console.log(`Publishing ${count} test messages...`);
    
    // Publish multiple messages
    for (let i = 1; i <= count; i++) {
      const testMessage = generateTestMessage(i);
      
      // Add message properties including a unique ID
      const messageProperties = {
        persistent: true,
        messageId: `test-msg-${Date.now()}-${i}`,
        timestamp: Date.now(),
        contentType: 'application/json'
      };
      
      channel.sendToQueue(
        queueName,
        Buffer.from(JSON.stringify(testMessage)),
        messageProperties
      );
      
      console.log(`Message ${i} published:`);
      console.log(JSON.stringify(testMessage, null, 2));
    }
    
    // Get queue info after publishing
    const queueInfoAfter = await channel.checkQueue(queueName);
    console.log(`Queue stats after: ${queueInfoAfter.messageCount} messages in queue`);
    
    console.log('✅ All test messages published successfully');
    
    // Close the connection after a short delay
    setTimeout(() => {
      connection.close();
      console.log('Connection closed');
    }, 500);
  } catch (error) {
    console.error('Error publishing test messages:', error);
    
    // Try to close the connection if it's open
    if (connection) {
      try {
        await connection.close();
        console.log('Connection closed');
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
  }
}

// Get the number of messages to publish from command line argument or default to 3
const messageCount = process.argv[2] ? parseInt(process.argv[2]) : 3;

// Run the function
publishTestMessages(messageCount); 