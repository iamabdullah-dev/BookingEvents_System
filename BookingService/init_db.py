from app import db, app

# Don't create tables, just connect to existing database
with app.app_context():
    try:
        # Test the connection
        db.session.execute('SELECT 1')
        print("Successfully connected to the existing PostgreSQL database!")
    except Exception as e:
        print(f"Error connecting to the database: {e}")
        print("Please make sure your PostgreSQL server is running and the database exists.") 