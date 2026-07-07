# ArenaX — Round 7: react-snap prerendering fix

## What this fixes

Real Search Console data showed only 5 of your ~17 live routes have ever had
a Google impression — /tournament, /teamfinder, /games, /stream,
/communities, and /faq have none. Root cause, confirmed in your code: React
Helmet only injects per-page title/description/canonical/JSON-LD *after* the
JS bundle hydrates (`main.jsx` used `createRoot`, no SSR). Google's fast
first-pass crawl sees generic homepage metadata on every URL.

This patch adds prerendering so each route ships with its real, final HTML
already in place — no JS execution needed to see it.

## Files in this package (3 changed, repo-mirrored paths)

- `frontend/src/main.jsx` — switched to `hydrateRoot` when prerendered
  content exists in `#root`, falls back to `createRoot` otherwise. No
  behavior change for regular users; matters only for prerendered pages.
- `frontend/package.json` — added `react-snap` as a devDependency, a
  `prerender` script, and a `reactSnap` config block listing every static
  route to prerender (all your public pages + all 4 blog posts).
- `DEPLOY_HOSTINGER.md` — new section explaining exactly how and where to
  run the prerender step, and why.

## What I verified myself

- `npm run build` still completes cleanly with the `main.jsx` change — no
  regressions, same chunk output as before.
- Confirmed react-snap actually requires downloading real Chromium via
  Puppeteer, and that this download is blocked in my own sandboxed
  environment (`storage.googleapis.com` 403). I could not run the prerender
  step itself here.

## Important: run `npm run prerender` on your own machine, not Hostinger

This isn't a shortcut — it's a real constraint. Puppeteer downloads a ~100MB
Chromium binary and needs system libraries (libnss3, libatk, etc.) that most
shared Node.js hosting, including Hostinger's, doesn't reliably provide.
Wiring `react-snap` into Hostinger's own `postinstall`/build step risks a
silent failure on every future deploy. Instead:

```bash
cd frontend
npm install
npm run build
npm run prerender
```

Then upload the resulting `frontend/dist/` folder to Hostinger yourself
(don't let Hostinger's `postinstall` rebuild over it), or better: run these
same 3 commands in a GitHub Actions workflow (full Chromium support there)
and have CI push `dist/` to Hostinger as a deploy artifact. Full details are
in the updated `DEPLOY_HOSTINGER.md`.

## After deploying

Open a prerendered page's actual page source (not dev tools — "View Page
Source") for something like `/tournament` and confirm the title tag and
meta description are the real per-page ones, not the generic homepage
defaults, before any JS runs.

## Not included in this round

- `/tournament/:id` pages are intentionally left out of prerendering — they're
  DB-driven, react-snap can't discover them, and they're already covered by
  your dynamic sitemap.
- Backlinks/domain authority — still the other open item, not a code fix.
