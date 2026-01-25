import {
  type HistoricalEvent,
  type InsertHistoricalEvent,
  type Game,
  type InsertGame,
  type GameMove,
  type InsertGameMove,
  type Player,
  type InsertPlayer,
  type User,
  type InsertUser,
  type Friendship,
} from "@shared/schema";
import { randomUUID, webcrypto } from "crypto";
import fs from "fs";
import path from "path";

export type CreateGameOptions = {
  roomCode?: string;
  player1UserId?: string;
  gameMode?: "normal" | "hard";
  targetScore?: number;
  allowStealing?: boolean;
  categories?: string[];
  eras?: string[];
};

export interface IStorage {
  // Historical Events
  getHistoricalEvent(id: string): Promise<HistoricalEvent | undefined>;
  getAllHistoricalEvents(): Promise<HistoricalEvent[]>;
  getRandomHistoricalEvent(
    excludeIds?: string[],
    categories?: string[],
    eras?: string[],
  ): Promise<HistoricalEvent | undefined>;

  // Games
  getGame(id: string): Promise<Game | undefined>;
  getGameByRoomCode(roomCode: string): Promise<Game | undefined>;
  createGame(options: CreateGameOptions): Promise<Game>;
  updateGame(id: string, updates: Partial<Game>): Promise<Game | undefined>;
  joinGame(gameId: string, playerId: string, userId?: string): Promise<Game | undefined>;

  // Players
  createPlayer(player: InsertPlayer): Promise<Player>;
  getPlayer(id: string): Promise<Player | undefined>;
  updatePlayerColor(id: string, color: string): Promise<Player | undefined>;
  getGameByPlayerId(playerId: string): Promise<Game | undefined>;
  getGamesByPlayerId(playerId: string): Promise<Game[]>;

  // Game Moves
  getGameMoves(gameId: string): Promise<GameMove[]>;
  createGameMove(move: InsertGameMove): Promise<GameMove>;

  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<User>): Promise<User | undefined>;
  getGamesByUserId(userId: string, status?: string): Promise<Game[]>;
  getUserGameHistory(userId: string, limit?: number, offset?: number): Promise<Game[]>;

  // Friendships
  createFriendship(userId1: string, userId2: string): Promise<Friendship | undefined>; // allow undefined return if check fails, but Mem impl return Friendship. Let's align with others.
  // Actually Mem impl returned Friendship without undefined. But I'll make it Promise<Friendship>
  // Wait, I should match the implementation.
  // Interface:
  createFriendship(userId1: string, userId2: string): Promise<any>; // Using any to avoid import issues? No, I admitted `friendships` in schema.
  // Let's import `Friendship` in storage.ts imports first.
  getFriendship(userId1: string, userId2: string): Promise<Friendship | undefined>;
  getFriendships(userId: string): Promise<Friendship[]>;
  updateFriendshipStatus(id: string, status: string): Promise<Friendship | undefined>;
  deleteFriendship(id: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private historicalEvents: Map<string, HistoricalEvent>;
  private games: Map<string, Game>;
  private gameMoves: Map<string, GameMove>;
  private players: Map<string, Player>;
  private users: Map<string, User>;
  private friendships: Map<string, Friendship>;

  constructor() {
    this.historicalEvents = new Map();
    this.games = new Map();
    this.gameMoves = new Map();
    this.players = new Map();
    this.users = new Map();
    this.friendships = new Map();

    // Initialize with curated historical events
    this.initializeHistoricalEvents();
  }

  private initializeHistoricalEvents() {
    const eventsPath = path.join(__dirname, "events.json");
    const eventsData = fs.readFileSync(eventsPath, "utf-8");
    const events: HistoricalEvent[] = JSON.parse(eventsData);

    // Shuffle the events array using crypto-secure randomization
    for (let i = events.length - 1; i > 0; i--) {
      const array = new Uint32Array(1);
      webcrypto.getRandomValues(array);
      const j = array[0] % (i + 1);
      [events[i], events[j]] = [events[j], events[i]];
    }

    events.forEach((event) => {
      this.historicalEvents.set(event.id, event);
    });
  }

  async getHistoricalEvent(id: string): Promise<HistoricalEvent | undefined> {
    return this.historicalEvents.get(id);
  }

  async getAllHistoricalEvents(): Promise<HistoricalEvent[]> {
    return Array.from(this.historicalEvents.values());
  }

  async getRandomHistoricalEvent(
    excludeIds?: string[],
    categories?: string[],
    eras?: string[],
  ): Promise<HistoricalEvent | undefined> {
    let availableEvents = Array.from(this.historicalEvents.values()).filter(
      (event) => !excludeIds?.includes(event.id),
    );

    if (categories && categories.length > 0) {
      availableEvents = availableEvents.filter((event) =>
        categories.includes(event.category),
      );
    }

    if (eras && eras.length > 0) {
      availableEvents = availableEvents.filter((event) =>
        eras.includes(event.era),
      );
    }

    if (availableEvents.length === 0) return undefined;

    // Use crypto-secure randomization for better entropy
    const array = new Uint32Array(1);
    webcrypto.getRandomValues(array);
    const randomIndex = array[0] % availableEvents.length;
    return availableEvents[randomIndex];
  }

  async getGame(id: string): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async createGame(options: CreateGameOptions): Promise<Game> {
    const {
      roomCode,
      player1UserId,
      gameMode = "normal",
      targetScore = 10,
      allowStealing = false,
      categories = ["Politics", "Science", "History", "Culture"],
      eras = ["Ancient", "Classical", "Modern"],
    } = options;
    const id = randomUUID();

    // Get a truly random starting event using multiple attempts for better randomization
    let randomStartingEvent;
    for (let attempt = 0; attempt < 5; attempt++) {
      randomStartingEvent = await this.getRandomHistoricalEvent(
        [],
        categories,
        eras,
      );
      if (randomStartingEvent) break;
    }
    const startingEventId = randomStartingEvent?.id || "1"; // Fallback to ID "1" if no event found

    const game: Game = {
      id,
      roomCode: roomCode || null,
      player1UserId: player1UserId || null,
      player2UserId: null,
      player1Id: null,
      player2Id: null,
      currentTurn: null,
      player1Score: 0,
      player2Score: 0,
      targetScore: targetScore,
      currentEventId: null,
      placedEventIds: [startingEventId], // Start with random historical event
      attemptedEventIds: [startingEventId], // Track starting event as attempted
      gameStatus: "waiting",
      winnerPlayerId: null,
      createdAt: new Date(),
      lastMovedAt: null,
      gameMode: gameMode,
      attempts: 0,
      maxAttempts: gameMode === "hard" ? Math.floor(targetScore * 1.5) : null,
      allowStealing: allowStealing,
      stealingPlayerId: null,
      categories: categories,
      eras: eras,
    };

    this.games.set(id, game);
    return game;
  }

  async getGameByRoomCode(roomCode: string): Promise<Game | undefined> {
    return Array.from(this.games.values()).find(
      (game) => game.roomCode === roomCode,
    );
  }

  async joinGame(gameId: string, playerId: string, userId?: string): Promise<Game | undefined> {
    const game = this.games.get(gameId);
    if (!game) return undefined;

    let updatedGame: Game;
    if (!game.player1Id) {
      updatedGame = { ...game, player1Id: playerId, currentTurn: "player1" };
    } else if (!game.player2Id) {
      updatedGame = {
        ...game,
        player2Id: playerId,
        gameStatus: "playing",
        player2UserId: userId || null
      };
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
      color: null,
      ipAddress: player.ipAddress ?? null,
      location: player.location ?? null,
      createdAt: new Date(),
    };

    this.players.set(newPlayer.id, newPlayer);
    return newPlayer;
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async updatePlayerColor(
    id: string,
    color: string,
  ): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;

    const updatedPlayer = { ...player, color };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async getGameByPlayerId(playerId: string): Promise<Game | undefined> {
    return Array.from(this.games.values()).find(
      (game) => game.player1Id === playerId || game.player2Id === playerId,
    );
  }

  async updateGame(
    id: string,
    updates: Partial<Game>,
  ): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;

    const updatedGame = { ...game, ...updates };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async getGameMoves(gameId: string): Promise<GameMove[]> {
    return Array.from(this.gameMoves.values())
      .filter((move) => move.gameId === gameId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createGameMove(moveData: InsertGameMove): Promise<GameMove> {
    const id = randomUUID();
    const move: GameMove = {
      ...moveData,
      id,
      createdAt: new Date(),
    };

    this.gameMoves.set(id, move);
    return move;
  }

  // Friendships
  async createFriendship(userId1: string, userId2: string): Promise<Friendship> {
    const id = randomUUID();
    const friendship: Friendship = {
      id,
      userId1,
      userId2,
      status: "pending",
      createdAt: new Date(),
    };
    this.friendships.set(id, friendship);
    return friendship;
  }

  async getFriendship(userId1: string, userId2: string): Promise<Friendship | undefined> {
    return Array.from(this.friendships.values()).find(
      (f) =>
        (f.userId1 === userId1 && f.userId2 === userId2) ||
        (f.userId1 === userId2 && f.userId2 === userId1)
    );
  }

  async getFriendships(userId: string): Promise<Friendship[]> {
    return Array.from(this.friendships.values()).filter(
      (f) => f.userId1 === userId || f.userId2 === userId
    );
  }

  async updateFriendshipStatus(id: string, status: string): Promise<Friendship | undefined> {
    const friendship = this.friendships.get(id);
    if (!friendship) return undefined;
    const updated = { ...friendship, status };
    this.friendships.set(id, updated);
    return updated;
  }

  async deleteFriendship(id: string): Promise<void> {
    this.friendships.delete(id);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.googleId === googleId,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      id: randomUUID(),
      ...user,
      picture: user.picture ?? null,
      createdAt: new Date(),
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUser(id: string, user: Partial<User>): Promise<User | undefined> {
    const existingUser = this.users.get(id);
    if (!existingUser) return undefined;
    const updatedUser = { ...existingUser, ...user };
    this.users.set(id, updatedUser);
    return updatedUser;
  }


  async getGamesByPlayerId(playerId: string): Promise<Game[]> {
    return Array.from(this.games.values()).filter(
      (game) => game.player1Id === playerId || game.player2Id === playerId,
    );
  }

  async getGamesByUserId(userId: string, status?: string): Promise<Game[]> {
    let games = Array.from(this.games.values()).filter(
      (game) => game.player1UserId === userId || game.player2UserId === userId,
    );

    if (status) {
      games = games.filter((game) => game.gameStatus === status);
    }

    return games.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserGameHistory(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<Game[]> {
    const completedGames = Array.from(this.games.values())
      .filter((game) => (game.player1UserId === userId || game.player2UserId === userId) &&
        (game.gameStatus === "completed" || game.gameStatus === "abandoned"))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return completedGames.slice(offset, offset + limit);
  }

}

import { DrizzleStorage } from "./drizzle";
import { log } from "./log";

export async function initStorage(): Promise<IStorage> {
  if (process.env.DATABASE_URL) {
    log("Using Drizzle storage");
    return DrizzleStorage.build();
  }
  log("Using memory storage");
  return new MemStorage();
}
