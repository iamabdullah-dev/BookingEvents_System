# Booking Service

## Overview
The Booking Service is responsible for managing event bookings and payments in the Event Booking System. It handles the creation, retrieval, updating, and cancellation of bookings, as well as processing payments.

## Features
- Create new bookings for events
- Retrieve booking information
- Update booking details
- Cancel bookings
- Process payments
- Communicate with Event Service to check event availability
- Send booking notifications via RabbitMQ

## Tech Stack
- Flask: Web framework
- PostgreSQL: Database for storing booking and payment information
- SQLAlchemy: ORM for database operations
- RabbitMQ: Message broker for notifications
- Docker: Containerization

## Setup Instructions

### Prerequisites
- Python 3.8+
- PostgreSQL
- RabbitMQ

### Installation
1. Clone the repository
2. Navigate to the BookingService directory
3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
4. Set up environment variables in `.env` file:
   - FLASK_APP=app.py
   - FLASK_ENV=development
   - DATABASE_URL=postgresql://postgres:postgres@localhost/booking_service_db
   - EVENT_SERVICE_URL=http://localhost:8081
   - USER_SERVICE_URL=http://localhost:3001
   - RABBMQ_HOST=localhost
   - RABBITMQ_QUEUE=booking_notifications

5. Create the database:
   ```
   createdb booking_service_db
   ```

6. Run the application:
   ```
   flask run --port=8082
   ```

## API Endpoints

### Bookings
- `POST /api/bookings`: Create a new booking
- `GET /api/bookings`: Get all bookings
- `GET /api/bookings/{id}`: Get booking by ID
- `PUT /api/bookings/{id}`: Update booking
- `DELETE /api/bookings/{id}`: Cancel booking

### Payments
- `POST /api/payments`: Process payment for a booking

## Environment Variables
- `FLASK_APP`: Main application file
- `FLASK_ENV`: Environment (development/production)
- `DATABASE_URL`: PostgreSQL connection string
- `EVENT_SERVICE_URL`: URL of the Event Service
- `USER_SERVICE_URL`: URL of the User Service
- `RABBMQ_HOST`: RabbitMQ host address
- `RABBITMQ_QUEUE`: RabbitMQ queue name for notifications 