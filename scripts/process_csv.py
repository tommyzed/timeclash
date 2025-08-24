import csv
import json

def process_csv_events():
    events = []
    
    # Read the CSV file
    with open('./attached_assets/Chronology Data - V0.2.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            # Map category to match existing format
            category_map = {
                'Science/Tech': 'Science',
                'Arts/Culture': 'Culture', 
                'Politics/War': 'Politics',
                'Civilization': 'History',
                'Exploration': 'Exploration'
            }
            
            category = category_map.get(row['Category'], row['Category'])

            # Map era to match existing format.
            era_map = {
                'Ancient World': 'Ancient',
                'Modern Era': 'Modern',
                'Post-Classical': 'Classical',
            }
            era = era_map.get(row['Era'], row['Era'])
            
            # Create title
            title = row['Event Description']
            
            events.append({
                'id': row['Event ID'],
                'title': title,
                'description': row['Event Description'],
                'year': int(row['Year']),
                'category': category,
                'era': era
            })
    
    # Write to JSON file
    with open('./server/events.json', 'w', encoding='utf-8') as f:
        json.dump(events, f, indent=2)

if __name__ == "__main__":
    process_csv_events()
