// config/db.js
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false },
  max: 10,          // maximum concurrent connections
  idle_timeout: 30, // seconds before idle connections close
  connect_timeout: 5, // seconds to wait when connecting
});

export default sql;

(async () => {
  try {
    await sql`SELECT 1`;
    console.log("✅ Database connected");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
})();