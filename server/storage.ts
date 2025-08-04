import { type HistoricalEvent, type InsertHistoricalEvent, type Game, type InsertGame, type GameMove, type InsertGameMove } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Historical Events
  getHistoricalEvent(id: string): Promise<HistoricalEvent | undefined>;
  getAllHistoricalEvents(): Promise<HistoricalEvent[]>;
  getRandomHistoricalEvent(excludeIds?: string[]): Promise<HistoricalEvent | undefined>;
  
  // Games
  getGame(id: string): Promise<Game | undefined>;
  createGame(): Promise<Game>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined>;
  
  // Game Moves
  getGameMoves(gameId: string): Promise<GameMove[]>;
  createGameMove(move: InsertGameMove): Promise<GameMove>;
}

export class MemStorage implements IStorage {
  private historicalEvents: Map<string, HistoricalEvent>;
  private games: Map<string, Game>;
  private gameMoves: Map<string, GameMove>;

  constructor() {
    this.historicalEvents = new Map();
    this.games = new Map();
    this.gameMoves = new Map();
    
    // Initialize with curated historical events
    this.initializeHistoricalEvents();
  }

  private initializeHistoricalEvents() {
    const events: HistoricalEvent[] = [
      {
        id: "1",
        title: "American Declaration of Independence",
        description: "Signed in Philadelphia",
        year: 1776,
        category: "Politics"
      },
      {
        id: "2",
        title: "End of American Civil War",
        description: "Lee surrenders at Appomattox",
        year: 1865,
        category: "War"
      },
      {
        id: "3",
        title: "World War I Begins",
        description: "Assassination of Archduke Ferdinand",
        year: 1914,
        category: "War"
      },
      {
        id: "4",
        title: "First Moon Landing",
        description: "Apollo 11 mission success",
        year: 1969,
        category: "Science"
      },
      {
        id: "5",
        title: "The Berlin Wall Falls",
        description: "East and West Germany begin reunification as the wall comes down",
        year: 1989,
        category: "Politics"
      },
      {
        id: "6",
        title: "World War II Ends",
        description: "Japan surrenders after atomic bombs",
        year: 1945,
        category: "War"
      },
      {
        id: "7",
        title: "Internet Created",
        description: "ARPANET first message sent",
        year: 1969,
        category: "Technology"
      },
      {
        id: "8",
        title: "Napoleon Defeated at Waterloo",
        description: "End of Napoleon's Hundred Days",
        year: 1815,
        category: "War"
      },
      {
        id: "9",
        title: "Titanic Sinks",
        description: "Ship hits iceberg on maiden voyage",
        year: 1912,
        category: "Disaster"
      },
      {
        id: "10",
        title: "Wright Brothers First Flight",
        description: "First powered airplane flight",
        year: 1903,
        category: "Technology"
      },
      {
        id: "11",
        title: "Stock Market Crash",
        description: "Black Tuesday begins Great Depression",
        year: 1929,
        category: "Economics"
      },
      {
        id: "12",
        title: "Columbus Reaches Americas",
        description: "European discovery of the New World",
        year: 1492,
        category: "Exploration"
      },
      {
        id: "13",
        title: "Kennedy Assassination",
        description: "President shot in Dallas, Texas",
        year: 1963,
        category: "Politics"
      },
      {
        id: "14",
        title: "Chernobyl Nuclear Disaster",
        description: "Nuclear power plant explosion in Ukraine",
        year: 1986,
        category: "Disaster"
      },
      {
        id: "15",
        title: "9/11 Terrorist Attacks",
        description: "World Trade Center towers destroyed",
        year: 2001,
        category: "Terrorism"
      }
    ];

    events.forEach(event => {
      this.historicalEvents.set(event.id, event);
    });
  }

  async getHistoricalEvent(id: string): Promise<HistoricalEvent | undefined> {
    return this.historicalEvents.get(id);
  }

  async getAllHistoricalEvents(): Promise<HistoricalEvent[]> {
    return Array.from(this.historicalEvents.values());
  }

  async getRandomHistoricalEvent(excludeIds?: string[]): Promise<HistoricalEvent | undefined> {
    const availableEvents = Array.from(this.historicalEvents.values())
      .filter(event => !excludeIds?.includes(event.id));
    
    if (availableEvents.length === 0) return undefined;
    
    const randomIndex = Math.floor(Math.random() * availableEvents.length);
    return availableEvents[randomIndex];
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async createGame(): Promise<Game> {
    const id = randomUUID();
    const game: Game = {
      id,
      score: 0,
      targetScore: 10,
      currentEventId: null,
      placedEventIds: ["1"], // Start with Declaration of Independence
      isCompleted: false,
      createdAt: new Date()
    };
    
    this.games.set(id, game);
    return game;
  }

  async updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const updatedGame = { ...game, ...updates };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async getGameMoves(gameId: string): Promise<GameMove[]> {
    return Array.from(this.gameMoves.values())
      .filter(move => move.gameId === gameId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createGameMove(moveData: InsertGameMove): Promise<GameMove> {
    const id = randomUUID();
    const move: GameMove = {
      ...moveData,
      id,
      createdAt: new Date()
    };
    
    this.gameMoves.set(id, move);
    return move;
  }
}

export const storage = new MemStorage();
