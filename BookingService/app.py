from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import requests
import pika
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)
# Connect to existing PostgreSQL database
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost/booking_service_db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Models
class Booking(db.Model):
    __tablename__ = 'bookings'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, nullable=False)
    event_id = db.Column(db.String(50), nullable=False)
    tickets = db.Column(db.Integer, nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)
    status = db.Column(db.String(20), default='PENDING')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'event_id': self.event_id,
            'tickets': self.tickets,
            'total_price': float(self.total_price),
            'status': self.status,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class Payment(db.Model):
    __tablename__ = 'payments'
    
    id = db.Column(db.Integer, primary_key=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('bookings.id'))
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    payment_method = db.Column(db.String(50))
    transaction_id = db.Column(db.String(100))
    status = db.Column(db.String(20), default='PENDING')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'amount': float(self.amount),
            'payment_method': self.payment_method,
            'transaction_id': self.transaction_id,
            'status': self.status,
            'created_at': self.created_at.isoformat()
        }

# RabbitMQ connection
def publish_message(queue_name, message):
    try:
        # Try both variable names to handle potential typo in .env file
        rabbitmq_host = os.getenv('RABBITMQ_HOST', os.getenv('RABBMQ_HOST', 'localhost'))
        connection = pika.BlockingConnection(pika.ConnectionParameters(rabbitmq_host))
        channel = connection.channel()
        channel.queue_declare(queue=queue_name, durable=True)
        channel.basic_publish(
            exchange='',
            routing_key=queue_name,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=2,  # make message persistent
            )
        )
        connection.close()
        return True
    except Exception as e:
        print(f"Error publishing message: {e}")
        return False

# Mock payment gateway
def process_payment(amount, user_id):
    # In a real application, this would integrate with a payment gateway
    # For now, we'll just simulate a successful payment
    return {
        'success': True,
        'transaction_id': f'TXN-{user_id}-{int(datetime.utcnow().timestamp())}',
        'amount': amount,
        'status': 'COMPLETED'
    }

# Routes
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'UP'})

@app.route('/api/bookings', methods=['POST'])
def create_booking():
    data = request.json
    user_id = data.get('user_id')
    event_id = data.get('event_id')
    tickets = data.get('tickets')
    
    if not all([user_id, event_id, tickets]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check event availability
    try:
        event_service_url = os.getenv('EVENT_SERVICE_URL', 'http://localhost:8081')
        
        # First check if the event exists
        event_response = requests.get(f'{event_service_url}/api/events/{event_id}')
        if not event_response.ok:
            if event_response.status_code == 404:
                return jsonify({'error': f'Event with ID {event_id} not found'}), 404
            return jsonify({'error': 'Failed to get event details'}), 500
        
        event_data = event_response.json()
        
        # Then check availability
        availability_response = requests.get(
            f'{event_service_url}/api/events/{event_id}/availability',
            params={'tickets': tickets}
        )
        
        if not availability_response.ok:
            return jsonify({'error': 'Failed to check event availability'}), 500
        
        availability_data = availability_response.json()
        if not availability_data.get('available', False):
            return jsonify({'error': 'Not enough tickets available'}), 400
        
        total_price = float(event_data.get('price', 0)) * tickets
        
        # Create booking
        new_booking = Booking(
            user_id=user_id,
            event_id=event_id,
            tickets=tickets,
            total_price=total_price,
            status='PENDING'
        )
        
        db.session.add(new_booking)
        db.session.commit()
        
        # Send PENDING notification via RabbitMQ
        # Get user email (in a real system, we would fetch this from the User Service)
        user_service_url = os.getenv('USER_SERVICE_URL', 'http://localhost:3001')
        user_email = f"user{user_id}@example.com"  # Mock email
        
        # Create notification data for PENDING booking
        notification_data = {
            'booking_id': new_booking.id,
            'user_id': new_booking.user_id,
            'user_email': user_email,
            'event_id': new_booking.event_id,
            'event_name': event_data.get('title', 'Unknown Event'),
            'tickets': new_booking.tickets,
            'total_price': float(new_booking.total_price),
            'status': 'PENDING',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Publish PENDING notification
        rabbitmq_queue = os.getenv('RABBITMQ_QUEUE', 'booking_notifications')
        publish_message(rabbitmq_queue, notification_data)
        
        # Process payment
        payment_result = process_payment(total_price, user_id)
        
        if payment_result['success']:
            # Create payment record
            payment_data = {
                'booking_id': new_booking.id,
                'amount': total_price,
                'payment_method': 'CREDIT_CARD',
                'transaction_id': payment_result['transaction_id'],
                'status': payment_result['status']
            }
            
            new_payment = Payment(**payment_data)
            db.session.add(new_payment)
            
            # Update booking status
            new_booking.status = 'CONFIRMED'
            db.session.commit()
            
            # Update event ticket availability
            update_response = requests.put(
                f'{event_service_url}/api/events/{event_id}/book',
                params={'tickets': tickets}
            )
            
            if not update_response.ok:
                # In a real system, we would need to handle this failure properly
                # For now, we'll just log it
                print(f"Failed to update event ticket availability: {update_response.text}")
            
            # Send notification via RabbitMQ
            # Get user email (in a real system, we would fetch this from the User Service)
            user_service_url = os.getenv('USER_SERVICE_URL', 'http://localhost:3001')
            user_email = f"user{user_id}@example.com"  # Mock email
            
            notification_data = {
                'booking_id': new_booking.id,
                'user_id': user_id,
                'user_email': user_email,
                'event_id': event_id,
                'event_name': event_data.get('title'),
                'tickets': tickets,
                'total_price': total_price,
                'status': 'CONFIRMED',
                'timestamp': datetime.utcnow().isoformat()
            }
            
            rabbitmq_queue = os.getenv('RABBITMQ_QUEUE', 'booking_notifications')
            publish_message(rabbitmq_queue, notification_data)
            
            return jsonify({
                'message': 'Booking confirmed successfully',
                'booking': new_booking.to_dict(),
                'payment': new_payment.to_dict()
            }), 201
        else:
            # Payment failed
            new_booking.status = 'PAYMENT_FAILED'
            db.session.commit()
            
            return jsonify({
                'error': 'Payment failed',
                'booking': new_booking.to_dict()
            }), 400
            
    except Exception as e:
        db.session.rollback()
        print(f"Error creating booking: {e}")
        return jsonify({'error': 'Failed to process booking'}), 500

@app.route('/api/bookings/<int:booking_id>', methods=['GET'])
def get_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    
    payment = Payment.query.filter_by(booking_id=booking_id).first()
    
    return jsonify({
        'booking': booking.to_dict(),
        'payment': payment.to_dict() if payment else None
    })

@app.route('/api/bookings/user/<int:user_id>', methods=['GET'])
def get_user_bookings(user_id):
    bookings = Booking.query.filter_by(user_id=user_id).all()
    
    result = []
    for booking in bookings:
        payment = Payment.query.filter_by(booking_id=booking.id).first()
        result.append({
            'booking': booking.to_dict(),
            'payment': payment.to_dict() if payment else None
        })
    
    return jsonify(result)

@app.route('/api/bookings/<int:booking_id>/cancel', methods=['PUT'])
def cancel_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    
    if booking.status == 'CANCELLED':
        return jsonify({'message': 'Booking is already cancelled'}), 400
    
    # In a real system, we would implement refund logic here
    booking.status = 'CANCELLED'
    db.session.commit()
    
    # Update event ticket availability (add tickets back)
    try:
        event_service_url = os.getenv('EVENT_SERVICE_URL', 'http://localhost:8081')
        # This is a simplified approach - in a real system, we would have an API for this
        event_response = requests.get(f'{event_service_url}/api/events/{booking.event_id}')
        if event_response.ok:
            event_data = event_response.json()
            current_tickets = event_data.get('availableTickets', 0)
            
            # Update available tickets
            requests.put(
                f'{event_service_url}/api/events/{booking.event_id}',
                json={**event_data, 'availableTickets': current_tickets + booking.tickets}
            )
    except Exception as e:
        print(f"Error updating event tickets after cancellation: {e}")
    
    # Send cancellation notification
    try:
        user_email = f"user{booking.user_id}@example.com"  # Mock email
        
        notification_data = {
            'booking_id': booking.id,
            'user_id': booking.user_id,
            'user_email': user_email,
            'event_id': booking.event_id,
            'tickets': booking.tickets,
            'status': 'CANCELLED',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        rabbitmq_queue = os.getenv('RABBITMQ_QUEUE', 'booking_notifications')
        publish_message(rabbitmq_queue, notification_data)
    except Exception as e:
        print(f"Error sending cancellation notification: {e}")
    
    return jsonify({
        'message': 'Booking cancelled successfully',
        'booking': booking.to_dict()
    })

# New endpoint to create a pending booking
@app.route('/api/bookings/pending', methods=['POST'])
def create_pending_booking():
    data = request.json
    user_id = data.get('user_id')
    event_id = data.get('event_id')
    tickets = data.get('tickets')
    
    if not all([user_id, event_id, tickets]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check event availability
    try:
        event_service_url = os.getenv('EVENT_SERVICE_URL', 'http://localhost:8081')
        
        # First check if the event exists
        event_response = requests.get(f'{event_service_url}/api/events/{event_id}')
        if not event_response.ok:
            if event_response.status_code == 404:
                return jsonify({'error': f'Event with ID {event_id} not found'}), 404
            return jsonify({'error': 'Failed to get event details'}), 500
        
        event_data = event_response.json()
        
        # Then check availability
        availability_response = requests.get(
            f'{event_service_url}/api/events/{event_id}/availability',
            params={'tickets': tickets}
        )
        
        if not availability_response.ok:
            return jsonify({'error': 'Failed to check event availability'}), 500
        
        availability_data = availability_response.json()
        if not availability_data.get('available', False):
            return jsonify({'error': 'Not enough tickets available'}), 400
        
        total_price = float(event_data.get('price', 0)) * tickets
        
        # Create booking with PENDING status
        new_booking = Booking(
            user_id=user_id,
            event_id=event_id,
            tickets=tickets,
            total_price=total_price,
            status='PENDING'
        )
        
        db.session.add(new_booking)
        db.session.commit()
        
        # Send PENDING notification via RabbitMQ
        # Get user email (in a real system, we would fetch this from the User Service)
        user_service_url = os.getenv('USER_SERVICE_URL', 'http://localhost:3001')
        user_email = f"user{user_id}@example.com"  # Mock email
        
        # Create notification data for PENDING booking
        notification_data = {
            'booking_id': new_booking.id,
            'user_id': new_booking.user_id,
            'user_email': user_email,
            'event_id': new_booking.event_id,
            'event_name': event_data.get('title', 'Unknown Event'),
            'tickets': new_booking.tickets,
            'total_price': float(new_booking.total_price),
            'status': 'PENDING',
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Publish PENDING notification
        rabbitmq_queue = os.getenv('RABBITMQ_QUEUE', 'booking_notifications')
        publish_message(rabbitmq_queue, notification_data)
        
        return jsonify({
            'message': 'Pending booking created successfully',
            'booking': new_booking.to_dict(),
            'payment_url': f'http://localhost:5000/api/bookings/{new_booking.id}/confirm'
        }), 201
    except Exception as e:
        print(f"Error creating pending booking: {e}")
        return jsonify({'error': 'Server error'}), 500

# New endpoint to confirm a pending booking
@app.route('/api/bookings/<int:booking_id>/confirm', methods=['PUT'])
def confirm_booking(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify({'error': 'Booking not found'}), 404
    
    if booking.status != 'PENDING':
        return jsonify({'error': f'Booking is already in {booking.status} status'}), 400
    
    try:
        # Process payment
        payment_result = process_payment(booking.total_price, booking.user_id)
        
        if payment_result['success']:
            # Create payment record
            payment_data = {
                'booking_id': booking.id,
                'amount': booking.total_price,
                'payment_method': 'CREDIT_CARD',
                'transaction_id': payment_result['transaction_id'],
                'status': payment_result['status']
            }
            
            new_payment = Payment(**payment_data)
            db.session.add(new_payment)
            
            # Update booking status
            booking.status = 'CONFIRMED'
            db.session.commit()
            
            # Update event ticket availability
            event_service_url = os.getenv('EVENT_SERVICE_URL', 'http://localhost:8081')
            update_response = requests.put(
                f'{event_service_url}/api/events/{booking.event_id}/book',
                params={'tickets': booking.tickets}
            )
            
            if not update_response.ok:
                # In a real system, we would need to handle this failure properly
                # For now, we'll just log it
                print(f"Failed to update event ticket availability: {update_response.text}")
            
            # Get event details for notification
            event_response = requests.get(f'{event_service_url}/api/events/{booking.event_id}')
            event_data = {}
            if event_response.ok:
                event_data = event_response.json()
            
            # Send notification via RabbitMQ
            # Get user email (in a real system, we would fetch this from the User Service)
            user_service_url = os.getenv('USER_SERVICE_URL', 'http://localhost:3001')
            user_email = f"user{booking.user_id}@example.com"  # Mock email
            
            notification_data = {
                'booking_id': booking.id,
                'user_id': booking.user_id,
                'user_email': user_email,
                'event_id': booking.event_id,
                'event_name': event_data.get('title', 'Unknown Event'),
                'tickets': booking.tickets,
                'total_price': float(booking.total_price),
                'status': 'CONFIRMED',
                'timestamp': datetime.utcnow().isoformat()
            }
            
            rabbitmq_queue = os.getenv('RABBITMQ_QUEUE', 'booking_notifications')
            publish_message(rabbitmq_queue, notification_data)
            
            return jsonify({
                'message': 'Booking confirmed successfully',
                'booking': booking.to_dict(),
                'payment': new_payment.to_dict()
            }), 200
        else:
            # Payment failed
            booking.status = 'PAYMENT_FAILED'
            db.session.commit()
            
            return jsonify({
                'error': 'Payment failed',
                'booking': booking.to_dict()
            }), 400
            
    except Exception as e:
        db.session.rollback()
        print(f"Error confirming booking: {e}")
        return jsonify({'error': 'Failed to confirm booking'}), 500

# Don't create tables automatically since they already exist
# @app.before_first_request
# def create_tables():
#     db.create_all()

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8082))
    app.run(host='0.0.0.0', port=port, debug=True) 