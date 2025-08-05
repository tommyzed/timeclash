import { type HistoricalEvent, type InsertHistoricalEvent, type Game, type InsertGame, type GameMove, type InsertGameMove, type Player, type InsertPlayer } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Historical Events
  getHistoricalEvent(id: string): Promise<HistoricalEvent | undefined>;
  getAllHistoricalEvents(): Promise<HistoricalEvent[]>;
  getRandomHistoricalEvent(excludeIds?: string[]): Promise<HistoricalEvent | undefined>;
  
  // Games
  getGame(id: string): Promise<Game | undefined>;
  getGameByRoomCode(roomCode: string): Promise<Game | undefined>;
  createGame(roomCode?: string): Promise<Game>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined>;
  joinGame(gameId: string, playerId: string): Promise<Game | undefined>;
  
  // Players
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayer(id: string): Promise<Player | undefined>;
  
  // Game Moves
  getGameMoves(gameId: string): Promise<GameMove[]>;
  createGameMove(move: InsertGameMove): Promise<GameMove>;
}

export class MemStorage implements IStorage {
  private historicalEvents: Map<string, HistoricalEvent>;
  private games: Map<string, Game>;
  private gameMoves: Map<string, GameMove>;
  private players: Map<string, Player>;

  constructor() {
    this.historicalEvents = new Map();
    this.games = new Map();
    this.gameMoves = new Map();
    this.players = new Map();
    
    // Initialize with curated historical events
    this.initializeHistoricalEvents();
  }

  private initializeHistoricalEvents() {
    const events: HistoricalEvent[] = [
      {
        id: "1",
        title: "The first stone tools are made in Kenya, marking the beginning of technology.",
        description: "The first stone tools are made in Kenya, marking the beginning of technology.",
        year: -3300000,
        category: "Science"
      },
      {
        id: "2",
        title: "Homo habilis achieves the first likely control of fire and cooking.",
        description: "Homo habilis achieves the first likely control of fire and cooking.",
        year: -2300000,
        category: "Science"
      },
      {
        id: "3",
        title: "Early humans invent paint using ground ochre pigment in Zambia.",
        description: "Early humans invent paint using ground ochre pigment in Zambia.",
        year: -350000,
        category: "Culture"
      },
      {
        id: "4",
        title: "Anatomically modern humans arrive in Europe.",
        description: "Anatomically modern humans arrive in Europe.",
        year: -45000,
        category: "History"
      },
      {
        id: "5",
        title: "The first known representational paintings are created in the Chauvet Caves...",
        description: "The first known representational paintings are created in the Chauvet Caves in France.",
        year: -31000,
        category: "Culture"
      },
      {
        id: "6",
        title: "The first ceramics and evidence of weaving are created in Moravia.",
        description: "The first ceramics and evidence of weaving are created in Moravia.",
        year: -28000,
        category: "Science"
      },
      {
        id: "7",
        title: "The dog is domesticated in Siberia, becoming humanity's first animal companion.",
        description: "The dog is domesticated in Siberia, becoming humanity's first animal companion.",
        year: -23000,
        category: "History"
      },
      {
        id: "8",
        title: "The Venus of Willendorf, one of the earliest known sculptures, is carved.",
        description: "The Venus of Willendorf, one of the earliest known sculptures, is carved.",
        year: -22000,
        category: "Culture"
      },
      {
        id: "9",
        title: "The first pottery is created in China, used for cooking and storage.",
        description: "The first pottery is created in China, used for cooking and storage.",
        year: -18000,
        category: "Science"
      },
      {
        id: "10",
        title: "Agriculture begins in the Fertile Crescent with wheat and barley cultivation.",
        description: "Agriculture begins in the Fertile Crescent with the cultivation of wheat and barley.",
        year: -10000,
        category: "History"
      },
      {
        id: "11",
        title: "Göbekli Tepe, the world's oldest known temple complex, is built in Turkey.",
        description: "Göbekli Tepe, the world's oldest known temple complex, is built in Turkey.",
        year: -9500,
        category: "Culture"
      },
      {
        id: "12",
        title: "Rice is first domesticated and cultivated along the Yangtze River in China.",
        description: "Rice is first domesticated and cultivated along the Yangtze River in China.",
        year: -8000,
        category: "History"
      },
      {
        id: "13",
        title: "The first known alcohol fermentation (mead) occurs in China.",
        description: "The first known alcohol fermentation (mead) occurs in China.",
        year: -7000,
        category: "History"
      },
      {
        id: "14",
        title: "The first evidence of copper smelting is found in modern-day Serbia.",
        description: "The first evidence of copper smelting is found in modern-day Serbia.",
        year: -6000,
        category: "Science"
      },
      {
        id: "15",
        title: "The Sumerian civilization evolves in Mesopotamia, developing the first cities.",
        description: "The Sumerian civilization evolves in Mesopotamia, developing the first cities.",
        year: -5000,
        category: "History"
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

  async createGame(roomCode?: string): Promise<Game> {
    const id = randomUUID();
    const game: Game = {
      id,
      roomCode: roomCode || null,
      player1Id: null,
      player2Id: null,
      currentTurn: null,
      player1Score: 0,
      player2Score: 0,
      targetScore: 10,
      currentEventId: null,
      placedEventIds: ["1"], // Start with Declaration of Independence
      gameStatus: "waiting",
      winnerPlayerId: null,
      createdAt: new Date()
    };
    
    this.games.set(id, game);
    return game;
  }

  async getGameByRoomCode(roomCode: string): Promise<Game | undefined> {
    return Array.from(this.games.values()).find(game => game.roomCode === roomCode);
  }

  async joinGame(gameId: string, playerId: string): Promise<Game | undefined> {
    const game = this.games.get(gameId);
    if (!game) return undefined;

    let updatedGame: Game;
    if (!game.player1Id) {
      updatedGame = { ...game, player1Id: playerId, currentTurn: "player1" };
    } else if (!game.player2Id) {
      updatedGame = { ...game, player2Id: playerId, gameStatus: "playing" };
    } else {
      return undefined; // Game is full
    }

    this.games.set(gameId, updatedGame);
    return updatedGame;
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const newPlayer: Player = {
      id: randomUUID(),
      nickname: player.nickname,
      createdAt: new Date()
    };
    
    this.players.set(newPlayer.id, newPlayer);
    return newPlayer;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
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
