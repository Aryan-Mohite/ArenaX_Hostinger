# Squad Match + Karma/Reputation — new + changed files

Two features, cumulative: Squad Match (Gamer DNA swipe matching) plus a
post-match karma/reputation layer on top of it. Drop these into your
ArenaX_Hostinger repo at the same paths, overwriting any existing versions.

## New files
- database/migrations/2026_07_gamer_dna_swipe_match.sql
- database/migrations/2026_07b_match_karma.sql
- src/controllers/gamerDnaController.js
- src/routes/gamerDnaRoutes.js
- frontend/src/pages/SquadMatch.jsx
- frontend/src/services/gamerDnaService.js
- frontend/src/utils/karma.js

## Modified files (overwrite in place)
- src/app.js — registers /api/gamer-dna route
- src/controllers/chatController.js — adds swipe-match chat (mirrors DM chat)
- src/controllers/userController.js — public profile now returns karma_positive/karma_negative
- src/routes/chatRoutes.js — adds swipe/:matchId/messages routes
- frontend/src/App.jsx — adds /squadmatch route (protected, lazy-loaded)
- frontend/src/components/Navbar.jsx — adds "Squad Match" nav link
- frontend/src/components/ChatDrawer.jsx — adds chatType 'swipe' support
- frontend/src/context/ChatContext.jsx — adds swipe unread counts
- frontend/src/services/chatService.js — adds swipe chat API calls
- frontend/src/pages/UserProfile.jsx — shows "🌟 Trusted Teammate" badge when earned

## What karma does
- After a Squad Match, either person can rate the other 👍/👎 from the
  Matches tab — no scale, no comment field, low friction by design.
- Ratings are cached as `karma_positive`/`karma_negative` counts on `users`,
  updated transactionally so they stay in sync even if someone changes
  their rating later.
- Design choice: **karma only ever produces a positive badge.** With 5+
  ratings and an 80%+ positive ratio, a user gets a "🌟 Trusted Teammate"
  badge on their Squad Match card and public profile. Low or negative karma
  is never surfaced as a public label — that avoids turning informal peer
  ratings into a tool for public shaming or brigading. Negative counts still
  exist in the data (useful for internal moderation later) but the product
  never displays them.

## Setup steps
1. Copy all files above into your repo (matching paths)
2. Run BOTH migrations against your Hostinger MySQL, in order:
   - `2026_07_gamer_dna_swipe_match.sql`
   - `2026_07b_match_karma.sql`
   (safe to re-run — CREATE TABLE IF NOT EXISTS throughout)
3. No new npm packages required
4. Rebuild the frontend and redeploy as usual

## Verified
- All backend files pass `node --check`
- Frontend builds cleanly via `vite build` — SquadMatch (11kB) and karma.js
  compile as their own lazy-loaded chunks, no errors
