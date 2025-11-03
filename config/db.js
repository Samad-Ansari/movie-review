// config/db.js
import dns from "dns";
import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config();

// ✅ Force IPv4 (Render tries IPv6 first otherwise)
dns.setDefaultResultOrder("ipv4first");

// ✅ Initialize Postgres connection
const sql = postgres(process.env.DATABASE_URL, {
  ssl: { rejectUnauthorized: false }, // required for Supabase
  max: 10,                // max concurrent connections
  idle_timeout: 30,       // seconds before idle connections close
  connect_timeout: 10,    // seconds to wait when connecting
});

// ✅ Test connection
(async () => {
  try {
    await sql`SELECT NOW()`;
    console.log("✅ Database connected successfully");
  } catch (err) {
    console.error("❌ DB connection failed:", err);
  }
})();

export default sql;
