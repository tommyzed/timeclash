CREATE TABLE "user_sessions" (
	"sid" varchar PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp (6) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"google_id" varchar NOT NULL,
	"email" varchar NOT NULL,
	"name" varchar NOT NULL,
	"picture" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "user_id" varchar;--> statement-breakpoint
ALTER TABLE "games" ADD COLUMN "eras" text[] DEFAULT '{"Ancient", "Classical", "Modern"}'::text[] NOT NULL;--> statement-breakpoint
ALTER TABLE "historical_events" ADD COLUMN "era" text NOT NULL;-->statement-breakpoint
CREATE INDEX "idx_games_user_id" ON "games" ("user_id");-->statement-breakpoint
CREATE INDEX "idx_games_user_status" ON "games" ("user_id", "game_status");-->statement-breakpoint
CREATE INDEX "idx_games_user_created" ON "games" ("user_id", "created_at");