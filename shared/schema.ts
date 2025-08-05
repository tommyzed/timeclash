import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const historicalEvents = pgTable("historical_events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  year: integer("year").notNull(),
  category: text("category").notNull(),
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomCode: varchar("room_code").unique(),
  player1Id: varchar("player1_id"),
  player2Id: varchar("player2_id"),
  currentTurn: varchar("current_turn"), // player1 or player2
  player1Score: integer("player1_score").notNull().default(0),
  player2Score: integer("player2_score").notNull().default(0),
  targetScore: integer("target_score").notNull().default(10),
  currentEventId: varchar("current_event_id"),
  placedEventIds: text("placed_event_ids").array().notNull().default([]),
  gameStatus: varchar("game_status").notNull().default("waiting"), // waiting, playing, completed
  winnerPlayerId: varchar("winner_player_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const gameMoves = pgTable("game_moves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
  playerId: varchar("player_id").notNull(),
  eventId: varchar("event_id").notNull(),
  placedPosition: integer("placed_position").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertHistoricalEventSchema = createInsertSchema(historicalEvents).omit({
  id: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export const insertGameMoveSchema = createInsertSchema(gameMoves).omit({
  id: true,
  createdAt: true,
});

export type HistoricalEvent = typeof historicalEvents.$inferSelect;
export type InsertHistoricalEvent = z.infer<typeof insertHistoricalEventSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type GameMove = typeof gameMoves.$inferSelect;
export type InsertGameMove = z.infer<typeof insertGameMoveSchema>;

// Frontend-only types for game state
export type PlacedEvent = {
  event: HistoricalEvent;
  position: number;
  placedByPlayerId?: string;
  placedByPlayerName?: string;
};

export type GameState = {
  game: Game;
  placedEvents: PlacedEvent[];
  currentEvent: HistoricalEvent | null;
  recentMoves: (GameMove & { event: HistoricalEvent })[];
  currentPlayerId?: string;
  isMyTurn?: boolean;
};

// WebSocket message types for real-time communication
export type WebSocketMessage = 
  | { type: 'game_updated'; data: GameState }
  | { type: 'player_joined'; data: { playerId: string; roomCode: string } }
  | { type: 'move_made'; data: { playerId: string; eventId: string; position: number; isCorrect: boolean } }
  | { type: 'game_completed'; data: { winnerPlayerId: string; finalScores: { player1: number; player2: number } } }
  | { type: 'error'; data: { message: string } };

// Player management
export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nickname: varchar("nickname").notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
