import pika
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get RabbitMQ host from environment variables
# Try both variable names to handle potential typo in .env file
rabbitmq_host = os.getenv('RABBITMQ_HOST', os.getenv('RABBMQ_HOST', 'localhost'))
rabbitmq_queue = os.getenv('RABBITMQ_QUEUE', 'booking_notifications')

def test_rabbitmq_connection():
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(rabbitmq_host))
        channel = connection.channel()
        
        print(f"✅ Successfully connected to RabbitMQ at {rabbitmq_host}")
        
        # Declare the queue
        channel.queue_declare(queue=rabbitmq_queue, durable=True)
        print(f"✅ Successfully declared queue: {rabbitmq_queue}")
        
        # Send a test message
        test_message = {
            'type': 'TEST',
            'message': 'This is a test message from the Booking Service',
            'timestamp': '2023-01-01T12:00:00'
        }
        
        channel.basic_publish(
            exchange='',
            routing_key=rabbitmq_queue,
            body=json.dumps(test_message),
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
            )
        )
        
        print(f"✅ Successfully published test message to queue: {rabbitmq_queue}")
        
        connection.close()
        return True
    except Exception as e:
        print(f"❌ Error connecting to RabbitMQ: {e}")
        return False

if __name__ == "__main__":
    print("Testing connection to RabbitMQ...")
    print("================================")
    
    # Test connection to RabbitMQ
    test_rabbitmq_connection()
    
    print("\nTests completed!") 