import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";
import { IStorage } from "./storage";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { eq, sql } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

const { Pool } = pg;
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool, { schema });

export class DrizzleStorage implements IStorage {
  private constructor() {}

  static async build() {
    const storage = new DrizzleStorage();
    await storage.seed();
    return storage;
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

  async getHistoricalEvent(id: string): Promise<schema.HistoricalEvent | undefined> {
    const result = await db.select().from(schema.historicalEvents).where(eq(schema.historicalEvents.id, id));
    return result[0];
  }

  async getAllHistoricalEvents(): Promise<schema.HistoricalEvent[]> {
    return db.select().from(schema.historicalEvents);
  }

  async getRandomHistoricalEvent(
    excludeIds?: string[],
  ): Promise<schema.HistoricalEvent | undefined> {
    const query = excludeIds
      ? db.select().from(schema.historicalEvents).where(sql`${schema.historicalEvents.id} not in ${excludeIds}`).orderBy(sql`random()`).limit(1)
      : db.select().from(schema.historicalEvents).orderBy(sql`random()`).limit(1);

    const result = await query;
    return result[0];
  }
  async getGame(id: string): Promise<schema.Game | undefined> {
    const result = await db.select().from(schema.games).where(eq(schema.games.id, id));
    return result[0];
  }

  async getGameByRoomCode(roomCode: string): Promise<schema.Game | undefined> {
    const result = await db.select().from(schema.games).where(eq(schema.games.roomCode, roomCode));
    return result[0];
  }

  async createGame(roomCode?: string): Promise<schema.Game> {
    const randomStartingEvent = await this.getRandomHistoricalEvent();
    const startingEventId = randomStartingEvent?.id || "1";

    const newGame: schema.InsertGame = {
      roomCode: roomCode,
      placedEventIds: [startingEventId],
      attemptedEventIds: [startingEventId],
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
      updatedGame = await this.updateGame(gameId, { player1Id: playerId, currentTurn: "player1" });
    } else if (!game.player2Id) {
      updatedGame = await this.updateGame(gameId, { player2Id: playerId, gameStatus: "playing" });
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

  async getGameMoves(gameId: string): Promise<schema.GameMove[]> {
    return db.select().from(schema.gameMoves).where(eq(schema.gameMoves.gameId, gameId)).orderBy(sql`${schema.gameMoves.createdAt} desc`);
  }

  async createGameMove(move: schema.InsertGameMove): Promise<schema.GameMove> {
    const result = await db.insert(schema.gameMoves).values(move).returning();
    return result[0];
  }
}
