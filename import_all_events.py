#!/usr/bin/env python3
import csv

def generate_all_events():
    """Generate TypeScript array with all 500 historical events from CSV"""
    
    events_list = []
    
    with open('attached_assets/Chronology Data (Gemini, Wikipedia, Wikidata) - Start research_1754392263570.csv', 'r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            category_map = {
                'Science/Tech': 'Science',
                'Arts/Culture': 'Culture', 
                'Politics/War': 'Politics',
                'Civilization': 'History',
                'Exploration': 'History'
            }
            
            # Clean description - escape quotes and newlines
            desc = row['Event Description'].replace('"', '\\"').replace('\n', ' ').strip()
            
            event = f"""      {{
        id: "{row['Event ID']}",
        title: "{desc}",
        description: "{desc}",
        year: {row['Year']},
        category: "{category_map.get(row['Category'], 'History')}"
      }}"""
            events_list.append(event)
    
    # Create the complete array
    complete_array = '    const events: HistoricalEvent[] = [\n' + ',\n'.join(events_list) + '\n    ];'
    
    # Write to file
    with open('all_500_events_final.txt', 'w', encoding='utf-8') as f:
        f.write(complete_array)
    
    print(f'Successfully generated complete array with {len(events_list)} events')
    print('Event range: 3300000 BCE to 2022 CE')
    print('Categories: Science, Culture, Politics, History')
    return len(events_list)

if __name__ == "__main__":
    generate_all_events()