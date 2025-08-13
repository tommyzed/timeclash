import csv
import json

def process_csv_events():
    events = []
    
    # Read the CSV file
    with open('attached_assets/Chronology Data (Gemini, Wikipedia, Wikidata) - Start research_1754390078178.csv', 'r', encoding='utf-8') as f:
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
            
            # Create title (truncated description if too long)
            title = row['Event Description']
            if len(title) > 80:
                title = title[:77] + "..."
            
            events.append({
                'id': row['Event ID'],
                'title': title,
                'description': row['Event Description'],
                'year': int(row['Year']),
                'category': category
            })
    
    # Write to JSON file
    with open('server/events.json', 'w', encoding='utf-8') as f:
        json.dump(events, f, indent=2)

if __name__ == "__main__":
    process_csv_events()
