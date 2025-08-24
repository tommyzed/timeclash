import pg from "pg";

const { Pool } = pg;

async function run() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const client = await pool.connect();

  try {
    console.log("Applying database alteration...");
    await client.query(
      `ALTER TABLE "historical_events" DROP COLUMN "era"`
    );
    console.log("Database alteration applied successfully.");
  } catch (err) {
    console.error("Error applying database alteration:", err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
