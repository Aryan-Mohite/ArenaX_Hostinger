import "./src/config/env.js";
import http from "http";
import app from "./src/app.js";
import pool from "./src/config/db.js";

// ─── Required environment variable guard ──────────────────────────────────────
const REQUIRED_ENV = ["DB_USER", "DB_HOST", "DB_NAME", "DB_PASSWORD", "JWT_SECRET"];
const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
if (missing.length > 0) {
  console.error(`⚠️  Missing environment variables: ${missing.join(", ")} — check hPanel Node.js env vars`);
  // Log warning but do NOT exit — allows /health to respond so you can debug via browser
}

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`✅ ArenaX server running on port ${PORT} [${process.env.NODE_ENV}]`);
});

// ─── Graceful shutdown ────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(async () => {
    console.log("HTTP server closed.");
    try {
      await pool.end();
      console.log("DB pool closed.");
    } catch (err) {
      console.error("Error closing DB pool:", err.message);
    }
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT",  () => shutdown("SIGINT"));
