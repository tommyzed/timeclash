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
  era: text("era").notNull(),
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  roomCode: varchar("room_code").unique(),
  player1UserId: varchar("player1_user_id"), // Links P1 to authenticated user
  player2UserId: varchar("player2_user_id"), // Links P2 to authenticated user
  player1Id: varchar("player1_id"),
  player2Id: varchar("player2_id"),
  currentTurn: varchar("current_turn"), // player1 or player2
  player1Score: integer("player1_score").notNull().default(0),
  player2Score: integer("player2_score").notNull().default(0),
  targetScore: integer("target_score").notNull().default(10),
  currentEventId: varchar("current_event_id"),
  placedEventIds: text("placed_event_ids").array().notNull().default([]),
  attemptedEventIds: text("attempted_event_ids").array().notNull().default([]),
  gameStatus: varchar("game_status").notNull().default("waiting"), // waiting, playing, completed
  winnerPlayerId: varchar("winner_player_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  lastMovedAt: timestamp("last_moved_at").default(sql`now()`),
  gameMode: varchar("game_mode").notNull().default("normal"), // 'normal' or 'hard'
  maxAttempts: integer("max_attempts"),
  attempts: integer("attempts").notNull().default(0),
  allowStealing: boolean("allow_stealing").notNull().default(false),
  stealingPlayerId: varchar("stealing_player_id"),
  categories: text("categories")
    .array()
    .notNull()
    .default(sql`'{"Politics", "Science", "History", "Culture"}'::text[]`),
  eras: text("eras")
    .array()
    .notNull()
    .default(sql`'{"Ancient", "Classical", "Modern"}'::text[]`),
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
  recentMoves: (GameMove & { event: HistoricalEvent; playerName?: string })[];
  currentPlayerId?: string;
  isMyTurn?: boolean;
  playerStats?: {
    player1IncorrectCount: number;
    player2IncorrectCount: number;
  };
};

// WebSocket message types for real-time communication
export type WebSocketMessage =
  | { type: 'game_updated'; data: GameState }
  | { type: 'player_joined'; data: { playerId: string; roomCode: string } }
  | { type: 'move_made'; data: { playerId: string; eventId: string; position: number; isCorrect: boolean } }
  | { type: 'game_completed'; data: { winnerPlayerId: string; finalScores: { player1: number; player2: number } } }
  | { type: 'new_game_request'; data: { requestingPlayerId: string; requestingPlayerName: string } }
  | { type: 'new_game_accepted'; data: { newGameId: string; roomCode: string } }
  | { type: 'new_game_rejected'; data: { rejectingPlayerId: string } }
  | {
    type: "settings_changed";
    data: {
      changes: { setting: string; from: any; to: any }[];
      updaterPlayerId?: string;
    };
  }
  | { type: 'player_color_changed'; data: { playerId: string; color: string } }
  | { type: 'friend_request'; data: { requesterId: string; requesterName: string } }
  | { type: 'error'; data: { message: string } };

// Player management
export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  nickname: varchar("nickname").notNull(),
  color: varchar("color"),
  ipAddress: varchar("ip_address"),
  location: text("location"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

// User management for Google Login
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  googleId: varchar("google_id").unique().notNull(),
  email: varchar("email").unique().notNull(),
  name: varchar("name").notNull(),
  picture: text("picture"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// User sessions for connect-pg-simple
export const userSessions = pgTable("user_sessions", {
  sid: varchar("sid").primaryKey(),
  sess: json("sess").notNull(),
  expire: timestamp("expire", { precision: 6 }).notNull(),
});

// Friendships
export const friendships = pgTable("friendships", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId1: varchar("user_id_1").notNull(), // Requester
  userId2: varchar("user_id_2").notNull(), // Receiver
  status: varchar("status").notNull().default("pending"), // pending, accepted
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertFriendshipSchema = createInsertSchema(friendships).omit({
  id: true,
  createdAt: true,
});

export type Friendship = typeof friendships.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
