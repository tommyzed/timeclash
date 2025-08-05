#!/usr/bin/env python3
import csv
import json

def process_csv():
    events = []
    
    # Read the CSV file
    with open('attached_assets/Chronology Data (Gemini, Wikipedia, Wikidata) - Start research_1754391654231.csv', 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Convert category to match our schema
            category_map = {
                'Science/Tech': 'Science',
                'Arts/Culture': 'Culture', 
                'Politics/War': 'Politics',
                'Civilization': 'History',
                'Exploration': 'History'
            }
            
            # Clean the description by escaping quotes and newlines
            desc = row['Event Description'].replace('"', '\\"').replace('\n', ' ').strip()
            
            event = {
                'id': row['Event ID'],
                'title': desc,
                'description': desc,
                'year': int(row['Year']),
                'category': category_map.get(row['Category'], 'History')
            }
            events.append(event)
    
    # Generate TypeScript array
    ts_lines = []
    for event in events:
        title_escaped = event['title'].replace('"', '\\"')
        desc_escaped = event['description'].replace('"', '\\"')
        
        ts_lines.append(f'''      {{
        id: "{event['id']}",
        title: "{title_escaped}",
        description: "{desc_escaped}",
        year: {event['year']},
        category: "{event['category']}"
      }}''')
    
    # Write the TypeScript array to a file
    with open('events_data.ts', 'w', encoding='utf-8') as f:
        f.write('[\n')
        f.write(',\n'.join(ts_lines))
        f.write('\n    ]')
    
    print(f"Successfully processed {len(events)} events!")
    print(f"Data spans from {min(e['year'] for e in events)} to {max(e['year'] for e in events)}")
    
    return events

if __name__ == "__main__":
    process_csv()