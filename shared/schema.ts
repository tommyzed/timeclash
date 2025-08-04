import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
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
  score: integer("score").notNull().default(0),
  targetScore: integer("target_score").notNull().default(10),
  currentEventId: varchar("current_event_id"),
  placedEventIds: text("placed_event_ids").array().notNull().default([]),
  isCompleted: boolean("is_completed").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const gameMoves = pgTable("game_moves", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  gameId: varchar("game_id").notNull(),
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
};

export type GameState = {
  game: Game;
  placedEvents: PlacedEvent[];
  currentEvent: HistoricalEvent | null;
  recentMoves: (GameMove & { event: HistoricalEvent })[];
};
