const amqp = require('amqplib');
require('dotenv').config();

// RabbitMQ connection details
const rabbitmqHost = process.env.RABBITMQ_HOST || 'localhost';
const queueName = process.env.RABBITMQ_QUEUE || 'booking_notifications';

/**
 * Check the status of the RabbitMQ queue
 */
async function checkQueueStatus() {
  let connection;
  let channel;
  
  try {
    console.log(`Connecting to RabbitMQ at ${rabbitmqHost}...`);
    connection = await amqp.connect(`amqp://${rabbitmqHost}`);
    channel = await connection.createChannel();
    
    console.log(`Checking queue: ${queueName}`);
    
    // Get queue info
    try {
      const queueInfo = await channel.checkQueue(queueName);
      console.log('✅ Queue exists and is accessible');
      console.log('Queue information:');
      console.log(`- Name: ${queueName}`);
      console.log(`- Messages: ${queueInfo.messageCount}`);
      console.log(`- Consumers: ${queueInfo.consumerCount}`);
    } catch (error) {
      if (error.code === 404) {
        console.log(`❌ Queue '${queueName}' does not exist`);
        
        // Create the queue if it doesn't exist
        console.log(`Creating queue: ${queueName}`);
        await channel.assertQueue(queueName, { durable: true });
        console.log('✅ Queue created successfully');
        
        const newQueueInfo = await channel.checkQueue(queueName);
        console.log(`- Messages: ${newQueueInfo.messageCount}`);
        console.log(`- Consumers: ${newQueueInfo.consumerCount}`);
      } else {
        throw error;
      }
    }
    
    // List all queues
    console.log('\nListing all queues:');
    const allQueues = await channel.assertExchange('', 'direct', { durable: true })
      .then(() => channel.bindQueue('', '', ''))
      .catch(() => {
        console.log('Could not list all queues (this may require admin privileges)');
        return [];
      });
    
    if (allQueues.length > 0) {
      allQueues.forEach(q => {
        console.log(`- ${q.queue}: ${q.messageCount} messages`);
      });
    }
    
    // Close the connection
    await connection.close();
    console.log('\nConnection closed');
  } catch (error) {
    console.error('Error checking queue status:', error);
    
    // Try to close the connection if it's open
    if (connection) {
      try {
        await connection.close();
        console.log('Connection closed');
      } catch (closeError) {
        console.error('Error closing connection:', closeError);
      }
    }
    
    console.log('\nTroubleshooting tips:');
    console.log('1. Make sure RabbitMQ is running');
    console.log('2. Check that the connection string in your .env file is correct');
    console.log('3. Verify network connectivity to the RabbitMQ server');
    console.log('4. Ensure you have the necessary permissions to access the queue');
  }
}

// Run the function
checkQueueStatus(); 