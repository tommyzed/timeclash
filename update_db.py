import os
import json
import psycopg2

def update_database():
    """
    Connects to the PostgreSQL database, clears the historical_events table,
    and populates it with data from server/events.json.
    """
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        print("Error: DATABASE_URL environment variable not set.")
        return

    events_file = 'server/events.json'

    try:
        print(f"Reading event data from {events_file}...")
        with open(events_file, 'r', encoding='utf-8') as f:
            events = json.load(f)
        print(f"Successfully read {len(events)} events.")

        print("Connecting to the database...")
        conn = psycopg2.connect(db_url)
        cur = conn.cursor()
        print("Database connection successful.")

        print("Clearing the 'historical_events' table...")
        cur.execute("TRUNCATE TABLE historical_events;")
        print("Table cleared.")

        print("Inserting new data...")
        for event in events:
            cur.execute(
                """
                INSERT INTO historical_events (id, title, description, year, category)
                VALUES (%s, %s, %s, %s, %s)
                """,
                (event['id'], event['title'], event['description'], event['year'], event['category'])
            )

        conn.commit()
        print(f"Successfully inserted {len(events)} events into the database.")

    except FileNotFoundError:
        print(f"Error: The file {events_file} was not found.")
    except psycopg2.Error as e:
        print(f"Database error: {e}")
        if 'conn' in locals() and conn:
            conn.rollback()
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from {events_file}.")
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
    finally:
        if 'cur' in locals() and cur:
            cur.close()
        if 'conn' in locals() and conn:
            conn.close()
        print("Database connection closed.")

if __name__ == "__main__":
    # To run this script, you must first set the DATABASE_URL environment variable.
    # For example:
    # export DATABASE_URL='your_database_url_here'
    # python update_db.py
    update_database()
