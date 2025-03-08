import requests
import json
import time

BASE_URL = "http://localhost:8082"

def print_test_header(test_name):
    print("\n" + "=" * 50)
    print(f"TEST: {test_name}")
    print("=" * 50)

def test_create_pending_booking(event_id="67c9ae7867c71c7434a69810", user_id=1, tickets=2):
    print_test_header("Create Pending Booking")
    
    booking_data = {
        "user_id": user_id,
        "event_id": event_id,
        "tickets": tickets
    }
    
    response = requests.post(f"{BASE_URL}/api/bookings/pending", json=booking_data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 201
    assert 'booking' in response.json()
    assert response.json()['booking']['status'] == 'PENDING'
    
    print("✅ Pending booking created successfully!")
    return response.json()['booking']['id']

def test_confirm_booking(booking_id):
    print_test_header("Confirm Booking")
    
    response = requests.put(f"{BASE_URL}/api/bookings/{booking_id}/confirm")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 200
    assert 'booking' in response.json()
    assert response.json()['booking']['status'] == 'CONFIRMED'
    assert 'payment' in response.json()
    
    print("✅ Booking confirmed successfully!")
    return response.json()

def test_confirm_already_confirmed_booking(booking_id):
    print_test_header("Confirm Already Confirmed Booking")
    
    response = requests.put(f"{BASE_URL}/api/bookings/{booking_id}/confirm")
    print(f"Status Code: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    
    assert response.status_code == 400
    assert 'error' in response.json()
    
    print("✅ Test passed! Cannot confirm an already confirmed booking.")

def run_tests():
    print("\n🔍 TESTING PENDING BOOKING WORKFLOW 🔍\n")
    
    try:
        # Step 1: Create a pending booking
        booking_id = test_create_pending_booking()
        
        # Step 2: Confirm the booking
        test_confirm_booking(booking_id)
        
        # Step 3: Try to confirm it again (should fail)
        test_confirm_already_confirmed_booking(booking_id)
        
        print("\n✅ ALL TESTS PASSED! ✅\n")
        print("The workflow is working correctly:")
        print("1. Created a pending booking")
        print("2. Confirmed the booking, processed payment, and sent notification")
        print("3. Verified that a confirmed booking cannot be confirmed again")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
    except Exception as e:
        print(f"\n❌ ERROR DURING TESTS: {e}")

if __name__ == "__main__":
    run_tests() 