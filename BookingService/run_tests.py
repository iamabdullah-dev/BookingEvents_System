import os
import sys

def run_test(test_name, test_file):
    print(f"\n\n{'=' * 50}")
    print(f"Running {test_name}...")
    print(f"{'=' * 50}")
    
    # Run the test script
    os.system(f"python {test_file}")

if __name__ == "__main__":
    print("Running Booking Service Tests")
    print("============================")
    
    # Test database connection
    run_test("Database Connection Test", "test_db.py")
    
    # Test Event Service connection
    run_test("Event Service Connection Test", "test_event_service.py")
    
    # Test RabbitMQ connection
    run_test("RabbitMQ Connection Test", "test_rabbitmq.py")
    
    # Test API endpoints
    run_test("API Endpoints Test", "test_api.py")
    
    print("\n\nAll tests completed!") 