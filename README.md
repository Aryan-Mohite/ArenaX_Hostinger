# ArenaX — Achievement Backfill + Daily Check-in Fix

## What was wrong

1. **Achievements showing "completed" progress but still Locked** — achievement
   checks only fire on a *new* action (new post, new match, new team join).
   Actions that already happened before the feature was deployed (your 3 Nexus
   posts, your 1 team) never triggered a check, so they were never unlocked
   even though the progress bar (which reads live counts) correctly showed
   3/1, 1/1, etc.

2. **Login streak stuck at 0** — `updateLoginStreak()` only ran inside the
   `/auth/login` endpoint. Since your JWT is cached in `localStorage` and
   re-verified via `/auth/me` on repeat visits, most days never actually hit
   `/login` again — so the streak almost never incremented.

## The fixes

- **`backend/scripts/backfillAchievements.js`** — one-time script that reads
  every user's real current counts (posts, matches, active team memberships,
  streak) and awards anything already earned. Safe to re-run any time.
- **New `/api/achievements/checkin` endpoint** (GET status + POST claim) —
  decoupled from `/auth/login` entirely, so it works no matter how the user
  got their session.
- **`DailyCheckinButton`** — a card on the Homepage, visible only when today
  isn't claimed yet. Clicking it claims the day, shows a confirmation
  (+ any newly unlocked achievements), then disappears. It reappears
  automatically the next calendar day — no client-side timer, it just asks
  the server "is today claimed?" on each page load.

## How to apply

### Backend
1. Copy `backend/src/services/achievementService.js`,
   `backend/src/controllers/achievementController.js`, and
   `backend/src/routes/achievementRoutes.js` over your existing versions
   (same paths, `src/...`).
2. Copy `backend/scripts/backfillAchievements.js` into your repo's
   `scripts/` folder.
3. `backend/package.json` here has one addition — the
   `"backfill:achievements": "node scripts/backfillAchievements.js"` script
   entry. Add that line to your real `package.json` if you don't want to
   overwrite the whole file.
4. **Run the backfill once** (after step 1–2 are deployed and your DB is
   reachable):
   ```
   npm run backfill:achievements
   ```
   You'll see console output listing which achievements got awarded to which
   users. Re-running it is harmless — already-awarded achievements are
   skipped.

### Frontend
1. Copy `frontend/src/components/DailyCheckinButton.jsx` into your repo.
2. Copy `frontend/src/services/achievementService.js` over your existing
   version (adds `getCheckinStatus` / `claimCheckin`).
3. Copy `frontend/src/pages/Home.jsx` over your existing version (imports and
   renders `<DailyCheckinButton />` right below the stats bar).

No new npm packages needed for this round — no `package.json` changes on the
frontend.
