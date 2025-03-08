# Event Booking System API Documentation In Detail

This document provides comprehensive documentation for the Event Booking System's microservices architecture, including endpoints, request/response formats, and examples.

## Table of Contents

1. [User Service](#user-service)
2. [Event Service](#event-service)
3. [Booking Service](#booking-service)
4. [Notification Service](#notification-service)

---

## User Service

The User Service manages user authentication and user-related operations.

Base URL: `http://localhost:3001`

### Authentication Endpoints

#### Register a New User

**Endpoint:** `POST /api/auth/register`

**Description:** Creates a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword123",
  "full_name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 400 Bad Request: User already exists
- 500 Internal Server Error: Server error

#### Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates a user and returns a JWT token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Login successful",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- 401 Unauthorized: Invalid credentials
- 500 Internal Server Error: Server error

### User Endpoints

#### Get Current User Profile

**Endpoint:** `GET /api/users/me`

**Description:** Retrieves the profile of the currently authenticated user.

**Headers:**
- Authorization: Bearer {token}

**Response (200 OK):**
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "john@example.com",
  "full_name": "John Doe",
  "created_at": "2023-01-01T12:00:00Z"
}
```

**Error Responses:**
- 401 Unauthorized: No token provided or invalid token
- 404 Not Found: User not found
- 500 Internal Server Error: Server error

#### Get All Events

**Endpoint:** `GET /api/users/events`

**Description:** Retrieves all available events (proxies to Event Service).

**Headers:**
- Authorization: Bearer {token}

**Response (200 OK):**
```json
[
  {
    "id": "event-123",
    "title": "Summer Concert",
    "description": "Annual summer concert in the park",
    "date": "2023-07-15T18:00:00Z",
    "location": "Central Park",
    "price": 25.00,
    "availableTickets": 500,
    "imageUrl": "https://example.com/images/concert.jpg",
    "category": "Music"
  },
  // More events...
]
```

**Error Responses:**
- 401 Unauthorized: No token provided or invalid token
- 500 Internal Server Error: Error fetching events

#### Create a Booking

**Endpoint:** `POST /api/users/bookings`

**Description:** Creates a new booking for an event (proxies to Booking Service).

**Headers:**
- Authorization: Bearer {token}

**Request Body:**
```json
{
  "event_id": "event-123",
  "tickets": 2
}
```

**Response (201 Created):**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": 1,
    "user_id": 1,
    "event_id": "event-123",
    "tickets": 2,
    "total_price": 50.00,
    "status": "CONFIRMED",
    "created_at": "2023-01-01T12:00:00Z"
  }
}
```

**Error Responses:**
- 400 Bad Request: Missing required fields or not enough tickets available
- 401 Unauthorized: No token provided or invalid token
- 500 Internal Server Error: Error creating booking

#### Get User's Bookings

**Endpoint:** `GET /api/users/bookings`

**Description:** Retrieves all bookings for the currently authenticated user (proxies to Booking Service).

**Headers:**
- Authorization: Bearer {token}

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "event_id": "event-123",
    "tickets": 2,
    "total_price": 50.00,
    "status": "CONFIRMED",
    "created_at": "2023-01-01T12:00:00Z"
  },
  // More bookings...
]
```

**Error Responses:**
- 401 Unauthorized: No token provided or invalid token
- 500 Internal Server Error: Error fetching bookings

---

## Event Service

The Event Service manages event creation, retrieval, and ticket availability.

Base URL: `http://localhost:8081`

### Event Endpoints

#### Get All Events

**Endpoint:** `GET /api/events`

**Description:** Retrieves all events.

**Response (200 OK):**
```json
[
  {
    "id": "event-123",
    "title": "Summer Concert",
    "description": "Annual summer concert in the park",
    "date": "2023-07-15T18:00:00Z",
    "location": "Central Park",
    "price": 25.00,
    "availableTickets": 500,
    "imageUrl": "https://example.com/images/concert.jpg",
    "category": "Music",
    "createdAt": "2023-01-01T12:00:00Z",
    "updatedAt": "2023-01-01T12:00:00Z"
  },
  // More events...
]
```

#### Get Event by ID

**Endpoint:** `GET /api/events/{id}`

**Description:** Retrieves a specific event by ID.

**Response (200 OK):**
```json
{
  "id": "event-123",
  "title": "Summer Concert",
  "description": "Annual summer concert in the park",
  "date": "2023-07-15T18:00:00Z",
  "location": "Central Park",
  "price": 25.00,
  "availableTickets": 500,
  "imageUrl": "https://example.com/images/concert.jpg",
  "category": "Music",
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-01T12:00:00Z"
}
```

**Error Responses:**
- 404 Not Found: Event not found

#### Create Event

**Endpoint:** `POST /api/events`

**Description:** Creates a new event.

**Request Body:**
```json
{
  "title": "Summer Concert",
  "description": "Annual summer concert in the park",
  "date": "2023-07-15T18:00:00",
  "location": "Central Park",
  "price": 25.00,
  "availableTickets": 500,
  "imageUrl": "https://example.com/images/concert.jpg",
  "category": "Music"
}
```

**Response (201 Created):**
```json
{
  "id": "event-123",
  "title": "Summer Concert",
  "description": "Annual summer concert in the park",
  "date": "2023-07-15T18:00:00Z",
  "location": "Central Park",
  "price": 25.00,
  "availableTickets": 500,
  "imageUrl": "https://example.com/images/concert.jpg",
  "category": "Music",
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-01T12:00:00Z"
}
```

**Error Responses:**
- 400 Bad Request: Validation failed (missing required fields)
- 500 Internal Server Error: Server error

#### Update Event

**Endpoint:** `PUT /api/events/{id}`

**Description:** Updates an existing event.

**Request Body:**
```json
{
  "title": "Updated Summer Concert",
  "description": "Annual summer concert in the park",
  "date": "2023-07-15T18:00:00Z",
  "location": "Central Park",
  "price": 30.00,
  "availableTickets": 450,
  "imageUrl": "https://example.com/images/concert.jpg",
  "category": "Music"
}
```

**Response (200 OK):**
```json
{
  "id": "event-123",
  "title": "Updated Summer Concert",
  "description": "Annual summer concert in the park",
  "date": "2023-07-15T18:00:00Z",
  "location": "Central Park",
  "price": 30.00,
  "availableTickets": 450,
  "imageUrl": "https://example.com/images/concert.jpg",
  "category": "Music",
  "createdAt": "2023-01-01T12:00:00Z",
  "updatedAt": "2023-01-01T13:00:00Z"
}
```

**Error Responses:**
- 404 Not Found: Event not found
- 400 Bad Request: Validation failed
- 500 Internal Server Error: Server error

#### Delete Event

**Endpoint:** `DELETE /api/events/{id}`

**Description:** Deletes an event.

**Response (204 No Content):**
No content in response body.

**Error Responses:**
- 404 Not Found: Event not found
- 500 Internal Server Error: Server error

#### Check Ticket Availability

**Endpoint:** `GET /api/events/{id}/availability?tickets={number}`

**Description:** Checks if the specified number of tickets is available for an event.

**Query Parameters:**
- tickets: Number of tickets to check

**Response (200 OK):**
```json
{
  "available": true
}
```

**Error Responses:**
- 404 Not Found: Event not found
- 500 Internal Server Error: Server error

#### Book Tickets

**Endpoint:** `PUT /api/events/{id}/book?tickets={number}`

**Description:** Books a specified number of tickets for an event (reduces available tickets).

**Query Parameters:**
- tickets: Number of tickets to book

**Response (200 OK):**
```json
{
  "success": true
}
```

**Error Responses:**
- 400 Bad Request: Not enough tickets available
- 404 Not Found: Event not found
- 500 Internal Server Error: Server error

---

## Booking Service

The Booking Service manages the booking process, including payment processing and notifications.

Base URL: `http://localhost:8082`

### Booking Endpoints

#### Create Booking

**Endpoint:** `POST /api/bookings`

**Description:** Creates a new booking with immediate payment processing.

**Request Body:**
```json
{
  "user_id": 1,
  "event_id": "event-123",
  "tickets": 2
}
```

**Response (201 Created):**
```json
{
  "message": "Booking created successfully",
  "booking": {
    "id": 1,
    "user_id": 1,
    "event_id": "event-123",
    "tickets": 2,
    "total_price": 50.00,
    "status": "CONFIRMED",
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T12:00:00Z"
  },
  "payment": {
    "id": 1,
    "booking_id": 1,
    "amount": 50.00,
    "payment_method": "CREDIT_CARD",
    "transaction_id": "TXN-1-1672574400",
    "status": "COMPLETED",
    "created_at": "2023-01-01T12:00:00Z"
  }
}
```

**Error Responses:**
- 400 Bad Request: Missing required fields or not enough tickets available
- 404 Not Found: Event not found
- 500 Internal Server Error: Server error

#### Get Booking by ID

**Endpoint:** `GET /api/bookings/{id}`

**Description:** Retrieves a specific booking by ID.

**Response (200 OK):**
```json
{
  "id": 1,
  "user_id": 1,
  "event_id": "event-123",
  "tickets": 2,
  "total_price": 50.00,
  "status": "CONFIRMED",
  "created_at": "2023-01-01T12:00:00Z",
  "updated_at": "2023-01-01T12:00:00Z"
}
```

**Error Responses:**
- 404 Not Found: Booking not found
- 500 Internal Server Error: Server error

#### Get User's Bookings

**Endpoint:** `GET /api/bookings/user/{userId}`

**Description:** Retrieves all bookings for a specific user.

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "user_id": 1,
    "event_id": "event-123",
    "tickets": 2,
    "total_price": 50.00,
    "status": "CONFIRMED",
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T12:00:00Z"
  },
  // More bookings...
]
```

**Error Responses:**
- 500 Internal Server Error: Server error

#### Cancel Booking

**Endpoint:** `PUT /api/bookings/{id}/cancel`

**Description:** Cancels a booking.

**Response (200 OK):**
```json
{
  "message": "Booking cancelled successfully",
  "booking": {
    "id": 1,
    "user_id": 1,
    "event_id": "event-123",
    "tickets": 2,
    "total_price": 50.00,
    "status": "CANCELLED",
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T13:00:00Z"
  }
}
```

**Error Responses:**
- 404 Not Found: Booking not found
- 400 Bad Request: Booking cannot be cancelled (e.g., already cancelled)
- 500 Internal Server Error: Server error

#### Create Pending Booking

**Endpoint:** `POST /api/bookings/pending`

**Description:** Creates a booking with PENDING status (payment to be processed later).

**Request Body:**
```json
{
  "user_id": 1,
  "event_id": "event-123",
  "tickets": 2
}
```

**Response (201 Created):**
```json
{
  "message": "Pending booking created successfully",
  "booking": {
    "id": 1,
    "user_id": 1,
    "event_id": "event-123",
    "tickets": 2,
    "total_price": 50.00,
    "status": "PENDING",
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T12:00:00Z"
  },
  "payment_url": "http://localhost:8082/api/bookings/1/confirm"
}
```

**Error Responses:**
- 400 Bad Request: Missing required fields or not enough tickets available
- 404 Not Found: Event not found
- 500 Internal Server Error: Server error

#### Confirm Pending Booking

**Endpoint:** `PUT /api/bookings/{id}/confirm`

**Description:** Confirms a pending booking by processing payment.

**Request Body:**
```json
{}
```

**Response (200 OK):**
```json
{
  "message": "Booking confirmed successfully",
  "booking": {
    "id": 1,
    "user_id": 1,
    "event_id": "event-123",
    "tickets": 2,
    "total_price": 50.00,
    "status": "CONFIRMED",
    "created_at": "2023-01-01T12:00:00Z",
    "updated_at": "2023-01-01T13:00:00Z"
  },
  "payment": {
    "id": 1,
    "booking_id": 1,
    "amount": 50.00,
    "payment_method": "CREDIT_CARD",
    "transaction_id": "TXN-1-1672578000",
    "status": "COMPLETED",
    "created_at": "2023-01-01T13:00:00Z"
  }
}
```

**Error Responses:**
- 404 Not Found: Booking not found
- 400 Bad Request: Booking is not in PENDING status
- 500 Internal Server Error: Server error or payment failed

#### Health Check

**Endpoint:** `GET /health`

**Description:** Checks if the service is running.

**Response (200 OK):**
```json
{
  "status": "UP"
}
```

---

## Notification Service

The Notification Service manages notifications for booking events.

Base URL: `http://localhost:3002`

### Notification Endpoints

#### Get All Notifications

**Endpoint:** `GET /api/notifications`

**Description:** Retrieves all notifications.

**Response (200 OK):**
```json
[
  {
    "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
    "booking_id": 1,
    "user_id": 1,
    "user_email": "john@example.com",
    "event_id": "event-123",
    "event_name": "Summer Concert",
    "tickets": 2,
    "total_price": 50.00,
    "status": "CONFIRMED",
    "notification_type": "EMAIL",
    "sent": true,
    "sent_at": "2023-01-01T12:05:00Z",
    "timestamp": "2023-01-01T12:00:00Z",
    "created_at": "2023-01-01T12:00:00Z"
  },
  // More notifications...
]
```

**Error Responses:**
- 500 Internal Server Error: Server error
- 503 Service Unavailable: Database connection unavailable

#### Get Notifications by User ID

**Endpoint:** `GET /api/notifications/user/{userId}`

**Description:** Retrieves all notifications for a specific user.

**Response (200 OK):**
```json
[
  {
    "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
    "booking_id": 1,
    "user_id": 1,
    "user_email": "john@example.com",
    "event_id": "event-123",
    "event_name": "Summer Concert",
    "tickets": 2,
    "total_price": 50.00,
    "status": "CONFIRMED",
    "notification_type": "EMAIL",
    "sent": true,
    "sent_at": "2023-01-01T12:05:00Z",
    "timestamp": "2023-01-01T12:00:00Z",
    "created_at": "2023-01-01T12:00:00Z"
  },
  // More notifications...
]
```

**Error Responses:**
- 400 Bad Request: Invalid user ID
- 500 Internal Server Error: Server error
- 503 Service Unavailable: Database connection unavailable

#### Get Notifications by Booking ID

**Endpoint:** `GET /api/notifications/booking/{bookingId}`

**Description:** Retrieves all notifications for a specific booking.

**Response (200 OK):**
```json
[
  {
    "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
    "booking_id": 1,
    "user_id": 1,
    "user_email": "john@example.com",
    "event_id": "event-123",
    "event_name": "Summer Concert",
    "tickets": 2,
    "total_price": 50.00,
    "status": "CONFIRMED",
    "notification_type": "EMAIL",
    "sent": true,
    "sent_at": "2023-01-01T12:05:00Z",
    "timestamp": "2023-01-01T12:00:00Z",
    "created_at": "2023-01-01T12:00:00Z"
  },
  // More notifications...
]
```

**Error Responses:**
- 400 Bad Request: Invalid booking ID
- 500 Internal Server Error: Server error
- 503 Service Unavailable: Database connection unavailable

#### Get Notifications by Status

**Endpoint:** `GET /api/notifications/status/{status}`

**Description:** Retrieves all notifications with a specific status (PENDING, CONFIRMED, or CANCELLED).

**Response (200 OK):**
```json
{
  "status": "success",
  "count": 1,
  "status_type": "CONFIRMED",
  "notifications": [
    {
      "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
      "booking_id": 1,
      "user_id": 1,
      "user_email": "john@example.com",
      "event_id": "event-123",
      "event_name": "Summer Concert",
      "tickets": 2,
      "total_price": 50.00,
      "status": "CONFIRMED",
      "notification_type": "EMAIL",
      "sent": true,
      "sent_at": "2023-01-01T12:05:00Z",
      "timestamp": "2023-01-01T12:00:00Z",
      "created_at": "2023-01-01T12:00:00Z"
    }
  ],
  "timestamp": "2023-01-01T13:00:00Z"
}
```

**Error Responses:**
- 400 Bad Request: Invalid status
- 500 Internal Server Error: Server error
- 503 Service Unavailable: Database connection unavailable

#### Get Latest Pending Notifications

**Endpoint:** `GET /api/notifications/pending?limit={number}`

**Description:** Retrieves the latest PENDING notifications with an optional limit.

**Query Parameters:**
- limit: Maximum number of notifications to return (default: 10)

**Response (200 OK):**
```json
{
  "status": "success",
  "count": 1,
  "total_pending": 1,
  "limit": 10,
  "notifications": [
    {
      "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
      "booking_id": 1,
      "user_id": 1,
      "user_email": "john@example.com",
      "event_id": "event-123",
      "event_name": "Summer Concert",
      "tickets": 2,
      "total_price": 50.00,
      "status": "PENDING",
      "notification_type": "EMAIL",
      "sent": true,
      "sent_at": "2023-01-01T12:05:00Z",
      "timestamp": "2023-01-01T12:00:00Z",
      "created_at": "2023-01-01T12:00:00Z"
    }
  ],
  "timestamp": "2023-01-01T13:00:00Z"
}
```

**Error Responses:**
- 500 Internal Server Error: Server error
- 503 Service Unavailable: Database connection unavailable

#### Get Notification Summary

**Endpoint:** `GET /api/notifications/summary`

**Description:** Retrieves counts of notifications by status.

**Response (200 OK):**
```json
{
  "status": "success",
  "counts": {
    "pending": 5,
    "confirmed": 10,
    "cancelled": 2,
    "total": 17
  },
  "timestamp": "2023-01-01T13:00:00Z"
}
```

**Error Responses:**
- 500 Internal Server Error: Server error
- 503 Service Unavailable: Database connection unavailable

#### Create Test Notification

**Endpoint:** `POST /api/notifications/test`

**Description:** Creates a test notification (for testing purposes).

**Request Body:**
```json
{
  "user_id": 1,
  "user_email": "john@example.com",
  "event_id": "event-123",
  "event_name": "Summer Concert",
  "tickets": 2,
  "total_price": 50.00,
  "status": "CONFIRMED"
}
```

**Response (201 Created):**
```json
{
  "message": "Test notification created successfully",
  "notification": {
    "_id": "60a1b2c3d4e5f6g7h8i9j0k1",
    "booking_id": 12345,
    "user_id": 1,
    "user_email": "john@example.com",
    "event_id": "event-123",
    "event_name": "Summer Concert",
    "tickets": 2,
    "total_price": 50.00,
    "status": "CONFIRMED",
    "notification_type": "EMAIL",
    "sent": true,
    "sent_at": "2023-01-01T12:05:00Z",
    "timestamp": "2023-01-01T12:00:00Z",
    "created_at": "2023-01-01T12:00:00Z"
  },
  "status": "success"
}
```

**Error Responses:**
- 400 Bad Request: Missing required fields
- 500 Internal Server Error: Server error
- 503 Service Unavailable: Database connection unavailable

#### Health Check

**Endpoint:** `GET /health`

**Description:** Checks if the service is running and connected to MongoDB.

**Response (200 OK):**
```json
{
  "status": "UP",
  "database": "connected"
}
```

**Error Responses:**
- 503 Service Unavailable: Database connection unavailable 