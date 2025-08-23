CREATE TABLE "game_moves" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_id" varchar NOT NULL,
	"player_id" varchar NOT NULL,
	"event_id" varchar NOT NULL,
	"placed_position" integer NOT NULL,
	"is_correct" boolean NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"room_code" varchar,
	"player1_id" varchar,
	"player2_id" varchar,
	"current_turn" varchar,
	"player1_score" integer DEFAULT 0 NOT NULL,
	"player2_score" integer DEFAULT 0 NOT NULL,
	"target_score" integer DEFAULT 10 NOT NULL,
	"current_event_id" varchar,
	"placed_event_ids" text[] DEFAULT '{}' NOT NULL,
	"attempted_event_ids" text[] DEFAULT '{}' NOT NULL,
	"game_status" varchar DEFAULT 'waiting' NOT NULL,
	"winner_player_id" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"game_mode" varchar DEFAULT 'normal' NOT NULL,
	"max_attempts" integer,
	"attempts" integer DEFAULT 0 NOT NULL,
	"allow_stealing" boolean DEFAULT false NOT NULL,
	"stealing_player_id" varchar,
	"categories" text[] DEFAULT '{"Politics", "Science", "History", "Culture"}'::text[] NOT NULL,
	CONSTRAINT "games_room_code_unique" UNIQUE("room_code")
);
--> statement-breakpoint
CREATE TABLE "historical_events" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"year" integer NOT NULL,
	"category" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "players" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nickname" varchar NOT NULL,
	"color" varchar,
	"created_at" timestamp DEFAULT now() NOT NULL
);
