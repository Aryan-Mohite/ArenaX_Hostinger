# Squad Match — new + changed files

Drop these into your ArenaX_Hostinger repo at the same paths, overwriting
the existing versions of any file already there. Nothing here needs merging
by hand — every file is a complete, final version.

## New files
- database/migrations/2026_07_gamer_dna_swipe_match.sql
- src/controllers/gamerDnaController.js
- src/routes/gamerDnaRoutes.js
- frontend/src/pages/SquadMatch.jsx
- frontend/src/services/gamerDnaService.js

## Modified files (overwrite in place)
- src/app.js — registers /api/gamer-dna route
- src/controllers/chatController.js — adds swipe-match chat (mirrors DM chat)
- src/routes/chatRoutes.js — adds swipe/:matchId/messages routes
- frontend/src/App.jsx — adds /squadmatch route (protected, lazy-loaded)
- frontend/src/components/Navbar.jsx — adds "Squad Match" nav link
- frontend/src/components/ChatDrawer.jsx — adds chatType 'swipe' support
- frontend/src/context/ChatContext.jsx — adds swipe unread counts
- frontend/src/services/chatService.js — adds swipe chat API calls

## Setup steps
1. Copy all files above into your repo (matching paths)
2. Run `database/migrations/2026_07_gamer_dna_swipe_match.sql` against your
   Hostinger MySQL database (phpMyAdmin or `mysql <` from CLI) — safe to
   re-run, uses CREATE TABLE IF NOT EXISTS
3. No new npm packages required — `npm install` only if your lockfile is
   out of sync for other reasons
4. Rebuild the frontend and redeploy as usual

## Verified
- Backend files pass `node --check`
- Frontend builds cleanly via `vite build` (SquadMatch compiles as its own
  9.3kB lazy-loaded chunk, no errors)
