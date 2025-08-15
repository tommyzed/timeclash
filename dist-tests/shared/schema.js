var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
export var historicalEvents = pgTable("historical_events", {
    id: varchar("id").primaryKey().default(sql(templateObject_1 || (templateObject_1 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    title: text("title").notNull(),
    description: text("description").notNull(),
    year: integer("year").notNull(),
    category: text("category").notNull(),
});
export var games = pgTable("games", {
    id: varchar("id").primaryKey().default(sql(templateObject_2 || (templateObject_2 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    roomCode: varchar("room_code").unique(),
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
    createdAt: timestamp("created_at").notNull().default(sql(templateObject_3 || (templateObject_3 = __makeTemplateObject(["now()"], ["now()"])))),
});
export var gameMoves = pgTable("game_moves", {
    id: varchar("id").primaryKey().default(sql(templateObject_4 || (templateObject_4 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    gameId: varchar("game_id").notNull(),
    playerId: varchar("player_id").notNull(),
    eventId: varchar("event_id").notNull(),
    placedPosition: integer("placed_position").notNull(),
    isCorrect: boolean("is_correct").notNull(),
    createdAt: timestamp("created_at").notNull().default(sql(templateObject_5 || (templateObject_5 = __makeTemplateObject(["now()"], ["now()"])))),
});
export var insertHistoricalEventSchema = createInsertSchema(historicalEvents).omit({
    id: true,
});
export var insertGameSchema = createInsertSchema(games).omit({
    id: true,
    createdAt: true,
});
export var insertGameMoveSchema = createInsertSchema(gameMoves).omit({
    id: true,
    createdAt: true,
});
// Player management
export var players = pgTable("players", {
    id: varchar("id").primaryKey().default(sql(templateObject_6 || (templateObject_6 = __makeTemplateObject(["gen_random_uuid()"], ["gen_random_uuid()"])))),
    nickname: varchar("nickname").notNull(),
    color: varchar("color"),
    createdAt: timestamp("created_at").notNull().default(sql(templateObject_7 || (templateObject_7 = __makeTemplateObject(["now()"], ["now()"])))),
});
export var insertPlayerSchema = createInsertSchema(players).omit({
    id: true,
    createdAt: true,
});
var templateObject_1, templateObject_2, templateObject_3, templateObject_4, templateObject_5, templateObject_6, templateObject_7;
