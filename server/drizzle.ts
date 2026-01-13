import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { IStorage, type CreateGameOptions } from "./storage";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { eq, or, sql } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const { Pool } = pg;
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

export class DrizzleStorage implements IStorage {
  private historicalEventsCache: schema.HistoricalEvent[] | null = null;
  private cacheLastRefreshed: Date | null = null;
  private cacheTtlHours: number;

  private constructor() {
    this.cacheTtlHours = process.env.HISTORICAL_EVENTS_CACHE_TTL_HOURS
      ? parseInt(process.env.HISTORICAL_EVENTS_CACHE_TTL_HOURS, 10)
      : 1;
    console.log("Events Cache TTL (hours): ", this.cacheTtlHours);
  }

  static async build() {
    const storage = new DrizzleStorage();
    await storage.seed();
    await storage.loadHistoricalEvents();
    return storage;
  }

  private async loadHistoricalEvents() {
    console.log("Cache is stale/invalid. Refreshing event data from db.");
    this.historicalEventsCache = await db.select().from(schema.historicalEvents);
    this.cacheLastRefreshed = new Date();
  }

  private isCacheStale(): boolean {
    if (!this.cacheLastRefreshed) {
      return true;
    }
    const ageInHours = (new Date().getTime() - this.cacheLastRefreshed.getTime()) / (1000 * 60 * 60);
    return ageInHours > this.cacheTtlHours;
  }

  private async ensureCacheIsFresh() {
    if (this.isCacheStale()) {
      await this.loadHistoricalEvents();
    }
  }

  private async seed() {
    const countResult = await db.select({ count: sql<number>`count(*)` }).from(schema.historicalEvents);
    const count = countResult[0].count;
    if (count > 0) {
      return;
    }

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const eventsPath = path.join(__dirname, "events.json");
    const eventsData = fs.readFileSync(eventsPath, "utf-8");
    const events: schema.InsertHistoricalEvent[] = JSON.parse(eventsData);

    await db.insert(schema.historicalEvents).values(events);
  }

  async getHistoricalEvent(id:string): Promise<schema.HistoricalEvent | undefined> {
    await this.ensureCacheIsFresh();
    return this.historicalEventsCache?.find(event => event.id === id);
  }

  async getAllHistoricalEvents(): Promise<schema.HistoricalEvent[]> {
    await this.ensureCacheIsFresh();
    return this.historicalEventsCache || [];
  }

  async getRandomHistoricalEvent(
    excludeIds?: string[],
    categories?: string[],
    eras?: string[],
  ): Promise<schema.HistoricalEvent | undefined> {
    await this.ensureCacheIsFresh();
    let availableEvents = this.historicalEventsCache?.filter(
      (event) => !excludeIds?.includes(event.id),
    );

    if (categories && categories.length > 0) {
      availableEvents = availableEvents?.filter((event) =>
        categories.includes(event.category),
      );
    }

    if (eras && eras.length > 0) {
      availableEvents = availableEvents?.filter((event) =>
        eras.includes(event.era),
      );
    }

    if (!availableEvents || availableEvents.length === 0) {
      return undefined;
    }

    const randomIndex = Math.floor(Math.random() * availableEvents.length);
    return availableEvents[randomIndex];
  }
  async getGame(id: string): Promise<schema.Game | undefined> {
    const result = await db.select().from(schema.games).where(eq(schema.games.id, id));
    return result[0];
  }

  async getGameByRoomCode(roomCode: string): Promise<schema.Game | undefined> {
    const result = await db.select().from(schema.games).where(eq(schema.games.roomCode, roomCode));
    return result[0];
  }

  async createGame(options: CreateGameOptions): Promise<schema.Game> {
    const {
      roomCode,
      gameMode = "normal",
      targetScore = 10,
      allowStealing = false,
      categories = ["Politics", "Science", "History", "Culture"],
      eras = ["Ancient", "Classical", "Modern"],
    } = options;
    const randomStartingEvent = await this.getRandomHistoricalEvent(
      [],
      categories,
      eras,
    );
    const startingEventId = randomStartingEvent?.id || "1";

    const newGame: schema.InsertGame = {
      roomCode: roomCode,
      placedEventIds: [startingEventId],
      attemptedEventIds: [startingEventId],
      gameMode: gameMode,
      targetScore: targetScore,
      attempts: 0,
      maxAttempts: gameMode === "hard" ? Math.floor(targetScore * 1.5) : null,
      allowStealing: allowStealing,
      categories: categories,
      eras: eras,
    };

    const result = await db.insert(schema.games).values(newGame).returning();
    return result[0];
  }

  async updateGame(id: string, updates: Partial<schema.Game>): Promise<schema.Game | undefined> {
    const result = await db.update(schema.games).set(updates).where(eq(schema.games.id, id)).returning();
    return result[0];
  }

  async joinGame(gameId: string, playerId: string): Promise<schema.Game | undefined> {
    const game = await this.getGame(gameId);
    if (!game) return undefined;

    let updatedGame;
    if (!game.player1Id) {
      // When player 1 joins, set them as the current turn
      updatedGame = await this.updateGame(gameId, {
        player1Id: playerId,
        currentTurn: "player1",
      });
    } else if (!game.player2Id) {
      // When player 2 joins, randomly decide who goes first
      const firstTurn = Math.random() < 0.5 ? "player1" : "player2";
      updatedGame = await this.updateGame(gameId, {
        player2Id: playerId,
        gameStatus: "playing",
        currentTurn: firstTurn,
      });
    } else {
      return undefined; // Game is full
    }
    return updatedGame;
  }
  async createPlayer(player: schema.InsertPlayer): Promise<schema.Player> {
    const result = await db.insert(schema.players).values(player).returning();
    return result[0];
  }

  async getPlayer(id: string): Promise<schema.Player | undefined> {
    const result = await db.select().from(schema.players).where(eq(schema.players.id, id));
    return result[0];
  }

  async updatePlayerColor(id: string, color: string): Promise<schema.Player | undefined> {
    const result = await db.update(schema.players).set({ color }).where(eq(schema.players.id, id)).returning();
    return result[0];
  }

  async getGameByPlayerId(playerId: string): Promise<schema.Game | undefined> {
    const result = await db
      .select()
      .from(schema.games)
      .where(
        or(
          eq(schema.games.player1Id, playerId),
          eq(schema.games.player2Id, playerId),
        ),
      );
    return result[0];
  }

  async getGameMoves(gameId: string): Promise<schema.GameMove[]> {
    return db.select().from(schema.gameMoves).where(eq(schema.gameMoves.gameId, gameId)).orderBy(sql`${schema.gameMoves.createdAt} desc`);
  }

  async createGameMove(move: schema.InsertGameMove): Promise<schema.GameMove> {
    const result = await db.insert(schema.gameMoves).values(move).returning();
    return result[0];
  }

  async getUser(id: string): Promise<schema.User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return result[0];
  }

  async getUserByGoogleId(googleId: string): Promise<schema.User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.googleId, googleId));
    return result[0];
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }
}
