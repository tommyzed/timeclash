#!/usr/bin/env python3
import csv
import json

def create_clean_storage():
    """Create a clean storage.ts file with properly escaped events"""
    
    # First, let's read and process all events properly
    events = []
    
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
            
            # Clean description - properly escape all quotes and special characters
            desc = row['Event Description']
            desc = desc.replace('\\', '\\\\')  # Escape backslashes first
            desc = desc.replace('"', '\\"')    # Escape double quotes
            desc = desc.replace('\n', ' ')     # Replace newlines with spaces
            desc = desc.replace('\r', '')      # Remove carriage returns
            desc = desc.strip()                # Remove leading/trailing whitespace
            
            event = {
                'id': row['Event ID'],
                'title': desc,
                'description': desc,
                'year': int(row['Year']),
                'category': category_map.get(row['Category'], 'History')
            }
            events.append(event)
    
    # Generate TypeScript events array
    events_ts = []
    for event in events:
        event_str = f'''      {{
        id: "{event['id']}",
        title: "{event['title']}",
        description: "{event['description']}",
        year: {event['year']},
        category: "{event['category']}"
      }}'''
        events_ts.append(event_str)
    
    events_array = 'const events: HistoricalEvent[] = [\n' + ',\n'.join(events_ts) + '\n    ];'
    
    # Create complete storage.ts content
    storage_content = f'''import {{ randomUUID }} from "crypto";
import {{ HistoricalEvent, Game, Player, GameMove, InsertGameMove }} from "../shared/schema";

export interface IStorage {{
  // Historical Events
  getHistoricalEvent(id: string): Promise<HistoricalEvent | undefined>;
  getAllHistoricalEvents(): Promise<HistoricalEvent[]>;
  getRandomHistoricalEvent(excludeIds?: string[]): Promise<HistoricalEvent | undefined>;

  // Games
  getGame(id: string): Promise<Game | undefined>;
  createGame(roomCode?: string): Promise<Game>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined>;
  joinGame(gameId: string, playerId: string): Promise<Game | undefined>;
  deleteGame(id: string): Promise<boolean>;
  
  // Players
  getPlayer(id: string): Promise<Player | undefined>;
  createPlayer(name: string): Promise<Player>;
  updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined>;
  
  // Game Moves
  getGameMoves(gameId: string): Promise<GameMove[]>;
  createGameMove(move: InsertGameMove): Promise<GameMove>;
}}

export class MemStorage implements IStorage {{
  private historicalEvents: Map<string, HistoricalEvent>;
  private games: Map<string, Game>;
  private gameMoves: Map<string, GameMove>;
  private players: Map<string, Player>;

  constructor() {{
    this.historicalEvents = new Map();
    this.games = new Map();
    this.gameMoves = new Map();
    this.players = new Map();
    
    // Initialize with all 500 historical events from CSV
    this.initializeHistoricalEvents();
  }}

  private initializeHistoricalEvents() {{
    // Complete dataset of all 500 historical events (3.3M BCE to 2022 CE)
    {events_array}

    // Shuffle the events array using crypto-secure randomization
    for (let i = events.length - 1; i > 0; i--) {{
      const array = new Uint32Array(1);
      webcrypto.getRandomValues(array);
      const j = array[0] % (i + 1);
      [events[i], events[j]] = [events[j], events[i]];
    }}

    events.forEach(event => {{
      this.historicalEvents.set(event.id, event);
    }});
  }}

  async getHistoricalEvent(id: string): Promise<HistoricalEvent | undefined> {{
    return this.historicalEvents.get(id);
  }}

  async getAllHistoricalEvents(): Promise<HistoricalEvent[]> {{
    return Array.from(this.historicalEvents.values());
  }}

  async getRandomHistoricalEvent(excludeIds?: string[]): Promise<HistoricalEvent | undefined> {{
    const availableEvents = Array.from(this.historicalEvents.values())
      .filter(event => !excludeIds?.includes(event.id));
    
    if (availableEvents.length === 0) return undefined;
    
    // Use crypto-secure randomization for better entropy
    const array = new Uint32Array(1);
    webcrypto.getRandomValues(array);
    const randomIndex = array[0] % availableEvents.length;
    return availableEvents[randomIndex];
  }}

  async getGame(id: string): Promise<Game | undefined> {{
    return this.games.get(id);
  }}

  async createGame(roomCode?: string): Promise<Game> {{
    const id = randomUUID();
    
    // Get a truly random starting event using multiple attempts for better randomization
    let randomStartingEvent;
    for (let attempt = 0; attempt < 5; attempt++) {{
      randomStartingEvent = await this.getRandomHistoricalEvent();
      if (randomStartingEvent) break;
    }}
    const startingEventId = randomStartingEvent?.id || "1"; // Fallback to ID "1" if no event found
    
    const game: Game = {{
      id,
      roomCode: roomCode || null,
      player1Id: null,
      player2Id: null,
      currentTurn: null,
      player1Score: 0,
      player2Score: 0,
      targetScore: 10,
      currentEventId: null,
      placedEventIds: [startingEventId], // Start with random historical event
      gameStatus: "waiting",
      winnerPlayerId: null,
      createdAt: new Date()
    }};
    
    this.games.set(id, game);
    return game;
  }}

  async updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined> {{
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const updatedGame = {{ ...game, ...updates }};
    this.games.set(id, updatedGame);
    return updatedGame;
  }}

  async joinGame(gameId: string, playerId: string): Promise<Game | undefined> {{
    const game = this.games.get(gameId);
    if (!game) return undefined;
    
    let updates: Partial<Game> = {{}};
    
    if (!game.player1Id) {{
      updates = {{ 
        player1Id: playerId,
        currentTurn: playerId,
        gameStatus: game.player2Id ? "active" : "waiting" 
      }};
    }} else if (!game.player2Id && game.player1Id !== playerId) {{
      updates = {{ 
        player2Id: playerId,
        gameStatus: "active"
      }};
    }}
    
    return this.updateGame(gameId, updates);
  }}

  async deleteGame(id: string): Promise<boolean> {{
    return this.games.delete(id);
  }}

  async getPlayer(id: string): Promise<Player | undefined> {{
    return this.players.get(id);
  }}

  async createPlayer(name: string): Promise<Player> {{
    const id = randomUUID();
    const player: Player = {{
      id,
      name,
      createdAt: new Date()
    }};
    
    this.players.set(id, player);
    return player;
  }}

  async updatePlayer(id: string, updates: Partial<Player>): Promise<Player | undefined> {{
    const player = this.players.get(id);
    if (!player) return undefined;
    
    const updatedPlayer = {{ ...player, ...updates }};
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }}

  async getGameMoves(gameId: string): Promise<GameMove[]> {{
    return Array.from(this.gameMoves.values())
      .filter(move => move.gameId === gameId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }}

  async createGameMove(move: InsertGameMove): Promise<GameMove> {{
    const id = randomUUID();
    const gameMove: GameMove = {{
      id,
      ...move,
      createdAt: new Date()
    }};
    
    this.gameMoves.set(id, gameMove);
    return gameMove;
  }}
}}'''
    
    # Write the complete storage file
    with open('server/storage_complete.ts', 'w', encoding='utf-8') as f:
        f.write(storage_content)
    
    print(f'Successfully created complete storage.ts with {len(events)} events')
    print('Event range: 3.3M BCE to 2022 CE')
    print('Categories: Science, Culture, Politics, History')
    return len(events)

if __name__ == "__main__":
    create_clean_storage()