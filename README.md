# ArenaX SEO Fixes — Round 6

Target keywords for this round: **tournaments, team finder, esports tournaments, esports team finder**

Build verified: `npm run build` completes clean with no errors after these changes.

## Files changed (7)

### 1. `frontend/src/components/Navbar.jsx`
Added "Blog" to the main navigation (`NAV_LINKS`). Previously Blog was only linked from the footer, meaning your only long-tail-keyword content type had the weakest internal-link placement on the site.

### 2. `frontend/public/robots.txt`
Removed the `Disallow: /` rule for GPTBot. It was fully blocking OpenAI's crawler while your GEO work (llms.txt route, noscript block) was specifically aimed at AI-search visibility — the two were contradicting each other.

### 3. `frontend/index.html`
- Rewrote the base `<meta name="description">`, `og:description`, and `twitter:description` to explicitly include "esports tournaments" and "team finder" (previously said "tournaments" and "build teams" — close but not the exact target phrases).
- Reordered `<meta name="keywords">` so the four priority keywords (esports tournaments, team finder, esports team finder, esports platform) lead the list.
- Rewrote the `<noscript>` GEO block's two headings/paragraphs ("Esports Tournaments" / "Esports Team Finder") to use the exact target phrases instead of paraphrases, since this is the primary content AI crawlers and non-JS bots actually see given the CSR architecture.

### 4. `frontend/src/pages/Home.jsx`
Homepage `<SEO>` description updated to include "esports tournaments" and "team finder" explicitly. Title (the brand tagline) left untouched — matches your stated preference for brand voice over keyword-stuffing, and the title tag is lower-leverage for these particular phrases than the description and H-tags are.

### 5. `frontend/src/pages/Tournament.jsx`
Tournament list page (`/tournament`):
- Title: `"Esports Tournaments — Valorant, CS2 & FPS Tournaments"` (was `"Valorant & FPS Tournaments"` — didn't contain "esports tournaments" or plain "tournaments" as a standalone phrase)
- Description rewritten to lead with "esports tournaments" and name all 6 supported games
- Added `BreadcrumbList` JSON-LD schema (Home → Tournaments) via `SEO.jsx`'s existing `jsonLd` prop

### 6. `frontend/src/pages/TeamFinder.jsx`
Team Finder page (`/teamfinder`):
- Title: `"Esports Team Finder — Find Teammates for Valorant, CS2 & More"` (was missing the "esports team finder" phrase)
- Description rewritten to lead with "esports team finder"
- Added `BreadcrumbList` JSON-LD schema (Home → Team Finder)

### 7. `frontend/src/pages/admin/AdminDashboard.jsx`
Added a missing `alt` attribute on a user-avatar `<img>` (found via a full codebase scan — this was the only genuinely missing `alt` in the entire frontend; everything else already had one, contrary to what a quick grep suggested). Low SEO impact since this page sits behind auth and is disallowed in robots.txt, but it's a real accessibility gap so it's fixed anyway.

## What this does NOT fix (still open — see the audit report)

- **Only 4 blog posts.** Nav placement is fixed; volume is a content problem, not a code problem. Recommended next-6-posts list is in the audit report, all chosen to reinforce "tournaments"/"team finder" and their long-tail variants.
- **CSR/prerendering gap.** The noscript block is now more keyword-aligned, but it's still a static hand-written summary, not real rendered content. Needs prerender.io middleware or an SSR migration to fully close.
- **Zero backlinks.** Unchanged — needs outreach/content marketing, not a code fix.
- **Per-game landing pages** (e.g. `/games/valorant`) — the single biggest untapped keyword surface for these exact target terms ("valorant esports tournaments," "cs2 team finder," etc.). Scoped as a Round 7 candidate in the audit, not built yet — would meaningfully multiply how many keyword variants you can rank for.

## Deploy notes

Files mirror the repo structure exactly — copy each into place at the matching path and redeploy. Run `npm run build` in `frontend/` before deploying to confirm it's still clean in your environment (verified clean here).
