import requests
import json
import time

BASE_URL = "http://localhost:8082"

def print_test_header(test_name):
    print("\n" + "=" * 50)
    print(f"TEST: {test_name}")
    print("=" * 50)

def test_health_check():
    print_test_header("Health Check")
    
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    assert response.status_code == 200
    assert response.json()['status'] == 'UP'
    
    print("✅ Test passed!")

def test_create_booking_success(event_id="67c9ae7867c71c7434a69810", user_id=1, tickets=2):
    print_test_header("Create Booking - Success")
    
    booking_data = {
        "user_id": user_id,
        "event_id": event_id,
        "tickets": tickets
    }
    
    response = requests.post(f"{BASE_URL}/api/bookings", json=booking_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 201
    assert 'booking' in response.json()
    assert response.json()['booking']['status'] == 'CONFIRMED'
    
    print("✅ Test passed!")
    return response.json()['booking']['id']

def test_create_booking_invalid_event():
    print_test_header("Create Booking - Invalid Event ID")
    
    booking_data = {
        "user_id": 1,
        "event_id": "invalid-event-id",
        "tickets": 2
    }
    
    response = requests.post(f"{BASE_URL}/api/bookings", json=booking_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code in [404, 500]  # Either not found or server error
    assert 'error' in response.json()
    
    print("✅ Test passed!")

def test_create_booking_missing_fields():
    print_test_header("Create Booking - Missing Fields")
    
    # Missing event_id
    booking_data = {
        "user_id": 1,
        "tickets": 2
    }
    
    response = requests.post(f"{BASE_URL}/api/bookings", json=booking_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 400
    assert 'error' in response.json()
    
    print("✅ Test passed!")

def test_get_booking(booking_id):
    print_test_header(f"Get Booking - ID: {booking_id}")
    
    response = requests.get(f"{BASE_URL}/api/bookings/{booking_id}")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 200
    assert 'booking' in response.json()
    assert response.json()['booking']['id'] == booking_id
    
    print("✅ Test passed!")
    return response.json()

def test_get_nonexistent_booking():
    print_test_header("Get Booking - Nonexistent ID")
    
    # Using a very large ID that's unlikely to exist
    response = requests.get(f"{BASE_URL}/api/bookings/99999")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 404
    assert 'error' in response.json()
    
    print("✅ Test passed!")

def test_get_user_bookings(user_id=1):
    print_test_header(f"Get User Bookings - User ID: {user_id}")
    
    response = requests.get(f"{BASE_URL}/api/bookings/user/{user_id}")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 200
    assert isinstance(response.json(), list)
    
    print("✅ Test passed!")
    return response.json()

def test_cancel_booking(booking_id):
    print_test_header(f"Cancel Booking - ID: {booking_id}")
    
    response = requests.put(f"{BASE_URL}/api/bookings/{booking_id}/cancel")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 200
    assert 'booking' in response.json()
    assert response.json()['booking']['status'] == 'CANCELLED'
    
    print("✅ Test passed!")
    return response.json()

def test_cancel_already_cancelled_booking(booking_id):
    print_test_header(f"Cancel Already Cancelled Booking - ID: {booking_id}")
    
    response = requests.put(f"{BASE_URL}/api/bookings/{booking_id}/cancel")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 400
    assert 'message' in response.json()
    assert 'already cancelled' in response.json()['message'].lower()
    
    print("✅ Test passed!")

def run_all_tests():
    print("\n🔍 STARTING COMPREHENSIVE BOOKING SERVICE TESTS 🔍\n")
    
    try:
        # Test 1: Health Check
        test_health_check()
        
        # Test 2: Create Booking - Success
        booking_id = test_create_booking_success()
        
        # Test 3: Create Booking - Invalid Event ID
        test_create_booking_invalid_event()
        
        # Test 4: Create Booking - Missing Fields
        test_create_booking_missing_fields()
        
        # Test 5: Get Booking
        test_get_booking(booking_id)
        
        # Test 6: Get Nonexistent Booking
        test_get_nonexistent_booking()
        
        # Test 7: Get User Bookings
        test_get_user_bookings()
        
        # Test 8: Cancel Booking
        test_cancel_booking(booking_id)
        
        # Test 9: Cancel Already Cancelled Booking
        test_cancel_already_cancelled_booking(booking_id)
        
        print("\n✅ ALL TESTS PASSED! ✅\n")
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
    except Exception as e:
        print(f"\n❌ ERROR DURING TESTS: {e}")

if __name__ == "__main__":
    run_all_tests() 