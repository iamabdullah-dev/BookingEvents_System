# Notification Service

This service is responsible for sending email and SMS notifications for the Event Booking System. It consumes messages from RabbitMQ and stores notification records in MongoDB.

## Features

- Consumes booking notification events from RabbitMQ
- Stores notification records in MongoDB
- Sends dummy email notifications (can be extended to use real email providers)
- Sends dummy SMS notifications (can be extended to use real SMS providers)
- Provides API endpoints to query notifications
- Automatically removes processed messages from the RabbitMQ queue

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- RabbitMQ

## Installation

1. Clone the repository
2. Navigate to the NotificationService directory
3. Install dependencies:

```bash
npm install
```

4. Configure environment variables in `.env` file:

```
PORT=3002
MONGODB_URI=mongodb://localhost:27017/notification_service_db
RABBITMQ_HOST=localhost
RABBITMQ_QUEUE=booking_notifications
EMAIL_SERVICE=gmail
EMAIL_USER=dummy@example.com
EMAIL_PASS=dummypassword
NODE_ENV=development
```

5. Check MongoDB connection:

```bash
node check_db.js
```

6. Check RabbitMQ queue status:

```bash
node check_queue.js
```

7. Initialize the MongoDB database:

```bash
node init_db.js
```

## Running the Service

Start the service:

```bash
npm start
```

For development with auto-reload:

```bash
npm run dev
```

## API Endpoints

- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/user/:userId` - Get notifications by user ID
- `GET /api/notifications/booking/:bookingId` - Get notifications by booking ID
- `GET /api/notifications/status/:status` - Get notifications by status
- `POST /api/notifications/test` - Create a test notification (for testing purposes)

## RabbitMQ Message Format

The service expects messages in the following format:

```json
{
  "booking_id": 123,
  "user_id": 456,
  "user_email": "user@example.com",
  "event_id": "789",
  "event_name": "Concert",
  "tickets": 2,
  "total_price": 100.00,
  "status": "CONFIRMED",
  "timestamp": "2023-01-01T12:00:00.000Z"
}
```

## Integration with Other Services

This service integrates with the Booking Service, which publishes notification events to RabbitMQ when bookings are created, confirmed, or cancelled.

## Testing

You can test the notification service in several ways:

### 1. Using the RabbitMQ Test Script

This simulates messages coming from the Booking Service:

```bash
# Send 3 test messages (default)
node test_rabbitmq.js

# Send a specific number of test messages
node test_rabbitmq.js 5
```

### 2. Using the Direct Insert Test

This tests direct insertion into MongoDB without using RabbitMQ:

```bash
node test_direct_insert.js
```

### 3. Using the Test API Endpoint

```bash
curl -X POST http://localhost:3002/api/notifications/test \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 123,
    "user_email": "test@example.com",
    "event_id": "456",
    "event_name": "Test Event",
    "tickets": 2,
    "total_price": 100.00,
    "status": "CONFIRMED"
  }'
```

## Queue Management

The service automatically acknowledges and removes messages from the RabbitMQ queue after they are successfully processed and stored in MongoDB. This prevents duplicate processing of messages.

You can check the current status of the RabbitMQ queue:

```bash
node check_queue.js
```

## Troubleshooting

### MongoDB Issues

1. **Check MongoDB Connection**:
   ```bash
   node check_db.js
   ```
   This will verify if MongoDB is accessible and show available collections.

2. **Initialize/Reset the Database**:
   ```bash
   node init_db.js
   ```
   This will create or reset the notifications collection with the correct schema.

3. **Common MongoDB Issues**:
   - Make sure MongoDB is running on your machine or the specified host
   - Check that the connection string in your .env file is correct
   - Ensure the database name is correct
   - Verify network connectivity to the MongoDB server

### RabbitMQ Issues

1. **Check RabbitMQ Connection and Queue Status**:
   ```bash
   node check_queue.js
   ```
   This will verify if RabbitMQ is accessible and show queue information.

2. **Test RabbitMQ Connection**:
   ```bash
   node test_rabbitmq.js
   ```
   This will attempt to publish test messages to RabbitMQ.

3. **Common RabbitMQ Issues**:
   - RabbitMQ service not running
   - Incorrect host or credentials
   - Network connectivity issues
   - Queue permissions 