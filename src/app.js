import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cors from "cors";

import authRoutes       from "./routes/authRoutes.js";
import userRoutes       from "./routes/userRoutes.js";
import gameRoutes       from "./routes/gameRoutes.js";
import tournamentRoutes from "./routes/tournamentRoutes.js";
import teamRoutes       from "./routes/teamRoutes.js";
import teamFinderRoutes from "./routes/teamFinderRoutes.js";
import communityRoutes  from "./routes/communityRoutes.js";
import streamRoutes     from "./routes/streamRoutes.js";
import matchRoutes      from "./routes/matchRoutes.js";
import archiveRoutes    from "./routes/archiveRoutes.js";
import adminRoutes      from "./routes/adminRoutes.js";
import chatRoutes       from "./routes/chatRoutes.js";

import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app = express();

// ─── TRUST PROXY ──────────────────────────────────────────────────────────────
app.set("trust proxy", 1);

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : "*", credentials: true }));

// ─── SECURITY HEADERS (Helmet) ────────────────────────────────────────────────
// Configured for same-origin SPA served by this Express server.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc:   ["'self'", "'unsafe-inline'"],
        styleSrc:    ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        fontSrc:     ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc:      ["'self'", "data:", "https:", "blob:"],
        connectSrc:  ["'self'"],
        mediaSrc:    ["'self'", "blob:", "https:"],
        frameSrc:    ["'none'"],
        objectSrc:   ["'none'"],
        baseUri:     ["'self'"],
        formAction:  ["'self'"],
        upgradeInsecureRequests: process.env.NODE_ENV === "production" ? [] : null,
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

// ─── RATE LIMITING ────────────────────────────────────────────────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many attempts — please try again in 15 minutes" },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests — please slow down" },
  skip: (req) => req.path.startsWith("/auth"),
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// ─── BODY PARSING ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// ─── HEALTH CHECK ─────────────────────────────────────────────────────────────
app.get("/health", async (_req, res) => {
  const checks = {
    status: "ok",
    timestamp: new Date().toISOString(),
    node: process.version,
    env: process.env.NODE_ENV || "not set",
    port: process.env.PORT || "not set (using 5000)",
    db: { host: process.env.DB_HOST || "not set", user: process.env.DB_USER || "not set", name: process.env.DB_NAME || "not set" },
    envVars: {
      DB_HOST:      !!process.env.DB_HOST,
      DB_USER:      !!process.env.DB_USER,
      DB_NAME:      !!process.env.DB_NAME,
      DB_PASSWORD:  !!process.env.DB_PASSWORD,
      JWT_SECRET:   !!process.env.JWT_SECRET,
    }
  };
  try {
    const pool = (await import("./config/db.js")).default;
    const conn = await pool.getConnection();
    conn.release();
    checks.dbConnection = "connected";
  } catch (e) {
    checks.dbConnection = "failed: " + e.message;
    checks.status = "degraded";
  }
  res.json(checks);
});

// ─── API ROUTES ───────────────────────────────────────────────────────────────
app.use("/api/auth",        authRoutes);
app.use("/api/users",       userRoutes);
app.use("/api/games",       gameRoutes);
app.use("/api/tournaments", tournamentRoutes);
app.use("/api/teams",       teamRoutes);
app.use("/api/teamfinder",  teamFinderRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/streams",     streamRoutes);
app.use("/api/matches",     matchRoutes);
app.use("/api/archive",     archiveRoutes);
app.use("/api/admin",       adminRoutes);
app.use("/api/chat",        chatRoutes);

// ─── SERVE REACT FRONTEND (SPA) ───────────────────────────────────────────────
// Serves the Vite-built React app for all non-API routes.
// frontend/dist is populated by running: npm run build:frontend
const distPath = path.resolve(__dirname, "../frontend/dist");
app.use(express.static(distPath));

// SPA fallback — any route not matched by the API returns index.html
// so React Router handles client-side navigation.
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

// ─── ERROR HANDLING (must come after all routes) ──────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
