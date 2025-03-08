import os
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get database URL from environment variables
database_url = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost/booking_service_db')

def test_db_connection():
    try:
        # Extract connection parameters from the URL
        # Format: postgresql://username:password@host:port/dbname
        parts = database_url.split('://', 1)[1].split('@')
        credentials = parts[0].split(':')
        host_db = parts[1].split('/')
        
        username = credentials[0]
        password = credentials[1]
        host = host_db[0]
        dbname = host_db[1]
        
        # Connect to the database
        conn = psycopg2.connect(
            dbname=dbname,
            user=username,
            password=password,
            host=host
        )
        
        # Create a cursor
        cur = conn.cursor()
        
        # Execute a simple query
        cur.execute("SELECT version();")
        
        # Fetch the result
        version = cur.fetchone()
        
        print("✅ Successfully connected to PostgreSQL")
        print(f"PostgreSQL version: {version[0]}")
        
        # Close the cursor and connection
        cur.close()
        conn.close()
        
        return True
    except Exception as e:
        print(f"❌ Error connecting to PostgreSQL: {e}")
        return False

if __name__ == "__main__":
    print("Testing connection to PostgreSQL...")
    print("==================================")
    
    # Test connection to PostgreSQL
    test_db_connection()
    
    print("\nTests completed!") 