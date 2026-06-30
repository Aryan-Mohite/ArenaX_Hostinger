import "./config/env.js";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import cors from "cors";
// SEO ADD 1: gzip compression — reduces page size, improves Core Web Vitals LCP
import compression from "compression";

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

// SEO ADD 2: gzip all responses — must be near the top, before routes
app.use(compression());

// ─── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "").split(",").map(s => s.trim()).filter(Boolean);
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : "*", credentials: true }));

// SEO ADD 3: www → non-www canonical redirect
// Prevents duplicate content between www.arenax.io and arenax.io
app.use((req, res, next) => {
  if (req.headers.host && req.headers.host.startsWith("www.")) {
    const canonical = req.headers.host.replace(/^www\./, "");
    return res.redirect(301, `https://${canonical}${req.url}`);
  }
  next();
});

// ─── SECURITY HEADERS (Helmet) ────────────────────────────────────────────────
// SEO FIX: Previous CSP blocked GTM and GA scripts from loading.
// scriptSrc and connectSrc now include Google Tag Manager and Analytics domains.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc:  ["'self'"],
        scriptSrc: [
          "'self'",
          "'unsafe-inline'",
          // SEO FIX: These were missing — GTM and GA were being blocked by CSP
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
          "https://ssl.google-analytics.com",
        ],
        styleSrc:    ["'self'", "https://fonts.googleapis.com", "'unsafe-inline'"],
        fontSrc:     ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: [
          "'self'",
          "data:",
          "https:",
          "blob:",
          // SEO FIX: GA tracking pixels need these
          "https://www.google-analytics.com",
          "https://www.googletagmanager.com",
        ],
        connectSrc: [
          "'self'",
          // SEO FIX: GA data collection endpoints
          "https://www.google-analytics.com",
          "https://analytics.google.com",
          "https://stats.g.doubleclick.net",
          "https://region1.google-analytics.com",
        ],
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

// SEO ADD 4: Cache headers for static assets and HTML
// Proper caching improves Core Web Vitals and reduces server load
app.use((req, res, next) => {
  if (/\.(css|js|png|jpg|jpeg|gif|ico|woff2|woff|ttf|svg|webp)$/.test(req.path)) {
    // Immutable assets (Vite hashes filenames) — cache for 1 year
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  } else if (req.path === "/" || req.path.endsWith(".html")) {
    // HTML — revalidate every hour
    res.setHeader("Cache-Control", "public, max-age=3600, must-revalidate");
  } else if (req.path === "/sitemap.xml" || req.path === "/robots.txt") {
    // SEO files — cache for 1 day
    res.setHeader("Cache-Control", "public, max-age=86400");
  }
  next();
});

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

// ─── SEO ADD 5: robots.txt route ──────────────────────────────────────────────
// Placed before API routes and static files so it's always served correctly.
// Disallows API/auth routes from being crawled (saves crawl budget).
app.get("/robots.txt", (_req, res) => {
  res.setHeader("Content-Type", "text/plain");
  res.send(
`User-agent: *
Allow: /
Disallow: /api/
Disallow: /auth/
Disallow: /admin/
Allow: /*.css$
Allow: /*.js$

User-agent: GPTBot
Disallow: /

Sitemap: https://arenax.io/sitemap.xml
`);
});

// ─── SEO ADD 6: Dynamic sitemap.xml route ─────────────────────────────────────
// Dynamic so it can include live tournament pages from the DB.
// Falls back gracefully if DB is unavailable.
app.get("/sitemap.xml", async (_req, res) => {
  const baseUrl = "https://arenax.io";
  const today   = new Date().toISOString().split("T")[0];

  // Static pages — FIXED to match real routes in frontend/src/App.jsx
  const staticPages = [
    { url: "/",            priority: "1.0", changefreq: "weekly"  },
    { url: "/games",       priority: "0.9", changefreq: "weekly"  },
    { url: "/tournament",  priority: "0.9", changefreq: "daily"   },
    { url: "/teamfinder",  priority: "0.9", changefreq: "weekly"  },
    { url: "/stream",      priority: "0.8", changefreq: "daily"   },
    { url: "/communities", priority: "0.7", changefreq: "weekly"  },
    { url: "/about",       priority: "0.5", changefreq: "monthly" },
  ];

  // Dynamic: pull live tournaments from DB for individual tournament URLs.
  // FIXED column names/values to match database/arenaX_schema_mysql.sql:
  //   tournament_id (not "id"), created_at (no updated_at column),
  //   status enum is upcoming/ongoing/completed/cancelled (no "active")
  let tournamentPages = [];
  try {
    const pool = (await import("./config/db.js")).default;
    const [rows] = await pool.query(
      "SELECT tournament_id, created_at FROM tournaments WHERE status IN ('upcoming','ongoing') LIMIT 200"
    );
    tournamentPages = rows.map((t) => ({
      // FIXED: route is /tournament/:id (singular), not /tournaments/:id
      url: `/tournament/${t.tournament_id}`,
      priority: "0.7",
      changefreq: "daily",
      lastmod: t.created_at
        ? new Date(t.created_at).toISOString().split("T")[0]
        : today,
    }));
  } catch (err) {
    // Sitemap still works if DB is down — just won't include tournament URLs
    console.warn("[sitemap] Could not fetch tournament pages:", err.message);
  }

  // Dynamic: pull games for /games/:slug style pages, if/when that route exists.
  // Currently /games is a single listing page (no per-game route in App.jsx),
  // so this is commented out until a /games/:slug route is added.
  //
  // let gamePages = [];
  // try {
  //   const pool = (await import("./config/db.js")).default;
  //   const [rows] = await pool.query("SELECT slug FROM games");
  //   gamePages = rows.map((g) => ({
  //     url: `/games/${g.slug}`,
  //     priority: "0.7",
  //     changefreq: "weekly",
  //   }));
  // } catch (err) {
  //   console.warn("[sitemap] Could not fetch game pages:", err.message);
  // }

  const allPages = [...staticPages, ...tournamentPages /*, ...gamePages */];

  const urlEntries = allPages
    .map(
      (p) => `
  <url>
    <loc>${baseUrl}${p.url}</loc>
    <lastmod>${p.lastmod || today}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;

  res.setHeader("Content-Type", "application/xml");
  res.send(xml);
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
