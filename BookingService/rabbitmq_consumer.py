import pika
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get RabbitMQ host from environment variables
rabbitmq_host = os.getenv('RABBITMQ_HOST', 'localhost')
rabbitmq_queue = os.getenv('RABBITMQ_QUEUE', 'booking_notifications')

def callback(ch, method, properties, body):
    """Process received messages"""
    try:
        message = json.loads(body)
        print("\n✉️ Received message:")
        print(json.dumps(message, indent=2))
        print("-" * 50)
        
        # Acknowledge the message (remove it from the queue)
        ch.basic_ack(delivery_tag=method.delivery_tag)
    except Exception as e:
        print(f"Error processing message: {e}")
        # Reject the message and requeue it
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=True)

def start_consumer():
    """Start consuming messages from the queue"""
    try:
        # Connect to RabbitMQ
        connection = pika.BlockingConnection(pika.ConnectionParameters(rabbitmq_host))
        channel = connection.channel()
        
        # Declare the queue (in case it doesn't exist yet)
        channel.queue_declare(queue=rabbitmq_queue, durable=True)
        
        # Set up the consumer
        channel.basic_consume(queue=rabbitmq_queue, on_message_callback=callback)
        
        print(f"🔍 Listening for messages on queue: {rabbitmq_queue}")
        print(f"Press Ctrl+C to exit")
        print("-" * 50)
        
        # Start consuming messages
        channel.start_consuming()
    except KeyboardInterrupt:
        print("\nConsumer stopped")
    except Exception as e:
        print(f"Error starting consumer: {e}")

if __name__ == "__main__":
    start_consumer() 