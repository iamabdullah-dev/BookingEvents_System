import requests
import json
import sys
import argparse

BASE_URL = "http://localhost:8082"

def test_health_check():
    response = requests.get(f"{BASE_URL}/health")
    print(f"Health Check: {response.status_code}")
    print(response.json())
    print()

def test_create_booking(event_id, user_id=1, tickets=2):
    # Using the provided event ID
    booking_data = {
        "user_id": user_id,
        "event_id": event_id,
        "tickets": tickets
    }
    
    response = requests.post(f"{BASE_URL}/api/bookings", json=booking_data)
    print(f"Create Booking: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    print()
    
    return response.json().get('booking', {}).get('id')

def test_get_booking(booking_id):
    response = requests.get(f"{BASE_URL}/api/bookings/{booking_id}")
    print(f"Get Booking: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    print()

def test_get_user_bookings(user_id=1):
    response = requests.get(f"{BASE_URL}/api/bookings/user/{user_id}")
    print(f"Get User Bookings: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    print()

def test_cancel_booking(booking_id):
    response = requests.put(f"{BASE_URL}/api/bookings/{booking_id}/cancel")
    print(f"Cancel Booking: {response.status_code}")
    print(json.dumps(response.json(), indent=2))
    print()

def parse_arguments():
    parser = argparse.ArgumentParser(description='Test Booking Service API')
    parser.add_argument('--event-id', type=str, default="67c9ae7867c71c7434a69810",
                        help='Event ID to use for booking (default: 67c9ae7867c71c7434a69810)')
    parser.add_argument('--user-id', type=int, default=1,
                        help='User ID to use for booking (default: 1)')
    parser.add_argument('--tickets', type=int, default=2,
                        help='Number of tickets to book (default: 2)')
    parser.add_argument('--skip-cancel', action='store_true',
                        help='Skip cancellation step (default: False)')
    return parser.parse_args()

if __name__ == "__main__":
    args = parse_arguments()
    
    print("Testing Booking Service API...")
    print("==============================")
    print(f"Using Event ID: {args.event_id}")
    print(f"Using User ID: {args.user_id}")
    print(f"Booking {args.tickets} tickets")
    print()
    
    # Test health check
    test_health_check()
    
    # Test create booking
    booking_id = test_create_booking(args.event_id, args.user_id, args.tickets)
    
    if booking_id:
        # Test get booking
        test_get_booking(booking_id)
        
        # Test get user bookings
        test_get_user_bookings(args.user_id)
        
        # Test cancel booking (unless skipped)
        if not args.skip_cancel:
            test_cancel_booking(booking_id)
        else:
            print("Skipping cancellation as requested")
    
    print("Tests completed!") 