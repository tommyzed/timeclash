#!/usr/bin/env python3
import csv

def process_csv_events():
    events = []
    
    # Read the CSV file
    with open('attached_assets/Chronology Data (Gemini, Wikipedia, Wikidata) - Start research_1754390078178.csv', 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for i, row in enumerate(reader):
            if i >= 50:  # Limit to first 50 events for performance
                break
            
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
            
            # Clean up quotes
            title = title.replace('"', '\\"')
            description = row['Event Description'].replace('"', '\\"')
            
            events.append({
                'id': row['Event ID'],
                'title': title,
                'description': description,
                'year': int(row['Year']),
                'category': category
            })
    
    # Generate TypeScript array
    print('const events: HistoricalEvent[] = [')
    for event in events:
        print(f'      {{')
        print(f'        id: "{event["id"]}",')
        print(f'        title: "{event["title"]}",')
        print(f'        description: "{event["description"]}",')
        print(f'        year: {event["year"]},')
        print(f'        category: "{event["category"]}"')
        print(f'      }},')
    print('    ];')

if __name__ == "__main__":
    process_csv_events()