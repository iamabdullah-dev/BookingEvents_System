import requests
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get Event Service URL from environment variables
event_service_url = os.getenv('EVENT_SERVICE_URL', 'http://localhost:8081')

def test_event_service_connection():
    try:
        # Try different health endpoints that might be available
        endpoints = [
            '/health', 
            '/actuator/health', 
            '/api/health', 
            '/',
            '/api/events',  # Try the events endpoint directly
            '/api/events/67c9ae7867c71c7434a69810'  # Try a specific event endpoint
        ]
        
        print(f"Trying to connect to Event Service at {event_service_url}")
        
        for endpoint in endpoints:
            try:
                print(f"Trying endpoint: {endpoint}")
                response = requests.get(f"{event_service_url}{endpoint}", timeout=5)
                print(f"Response status code: {response.status_code}")
                
                if response.status_code < 400:  # Any successful response
                    print(f"✅ Successfully connected to Event Service at {endpoint}")
                    try:
                        print(f"Response: {response.json() if response.headers.get('content-type') and 'application/json' in response.headers.get('content-type') else response.text[:100]}")
                    except:
                        print(f"Response: {response.text[:100]}")
                    return True
            except Exception as e:
                print(f"❌ Failed to connect to Event Service at {endpoint}: {e}")
        
        print("❌ Could not connect to Event Service on any endpoint")
        print(f"Please make sure the Event Service is running at {event_service_url}")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error connecting to Event Service: {e}")
        return False

def test_get_events():
    try:
        response = requests.get(f"{event_service_url}/api/events")
        if response.status_code == 200:
            events = response.json()
            print(f"✅ Successfully retrieved {len(events)} events from Event Service")
            for event in events:
                print(f"  - {event.get('title')} (ID: {event.get('id')})")
            return True
        else:
            print(f"❌ Failed to retrieve events. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error retrieving events: {e}")
        return False

def test_get_specific_event():
    event_id = "67c9ae7867c71c7434a69810"
    try:
        response = requests.get(f"{event_service_url}/api/events/{event_id}")
        if response.status_code == 200:
            event = response.json()
            print(f"✅ Successfully retrieved event with ID: {event_id}")
            print(f"  - Title: {event.get('title')}")
            print(f"  - Price: {event.get('price')}")
            print(f"  - Available Tickets: {event.get('availableTickets')}")
            return True
        else:
            print(f"❌ Failed to retrieve event with ID: {event_id}. Status code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error retrieving event: {e}")
        return False

if __name__ == "__main__":
    print("Testing connection to Event Service...")
    print("=====================================")
    
    # Test connection to Event Service
    if test_event_service_connection():
        # Test retrieving events
        test_get_events()
        
        # Test retrieving specific event
        test_get_specific_event()
    
    print("\nTests completed!")