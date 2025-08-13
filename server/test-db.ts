import { initStorage } from "./storage";
import { pool } from "./drizzle";

async function testDb() {
  console.log("Testing database connection...");
  const storage = await initStorage();
  const events = await storage.getAllHistoricalEvents();
  console.log("Fetched events:", events.slice(0, 5));
  console.log(`Total events: ${events.length}`);
  await pool.end();
  process.exit(0);
}

testDb();
