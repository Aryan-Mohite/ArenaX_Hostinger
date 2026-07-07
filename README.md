# ArenaX — FAQ Enhancement Package

## What changed

### 1. `frontend/src/components/Navbar.jsx`
- Added an **FAQ** link to `NAV_LINKS` (after "About"), so it now shows up in
  both the desktop nav bar and the mobile menu automatically — no other
  changes needed since both menus render from the same `NAV_LINKS` array.

### 2. `frontend/src/pages/Faq.jsx`
Rebuilt the FAQ page around **sectioned categories** instead of one flat list:

1. **About ArenaX** — what it is, who it's for, how to use it, free/pricing,
   supported games, browser-only access, global availability.
2. **Tournaments & Team Finder** — joining tournaments, finding teammates,
   formats, streaming, creating your own tournament/community.
3. **How ArenaX Compares** — why ArenaX vs. juggling separate tools, vs.
   Discord/Reddit for team finding, and why it isn't locked to one game.
4. **Data & Security** — selling/sharing data, account protection, what's
   collected, account/data deletion.
5. **Support & Troubleshooting** — contacting support, reporting bugs,
   suggesting features/games.

At the end of the page there's a dedicated **feedback/bug report block**
(styled as a card, separate from the FAQ accordion) directing users to
**support@arenax.io** for feedback, bugs, issues, or suggestions.

Technical notes:
- The `FAQPage` JSON-LD schema is still generated from **all** questions
  across every section (flattened via `FAQ_SECTIONS.flatMap(...)`), so no
  SEO/schema coverage was lost — it's actually broader now with the added
  questions.
- Accordion behavior unchanged (one item open at a time), now tracked by a
  `"sectionIndex-itemIndex"` key instead of a flat index.
- All existing original FAQ content was preserved; new questions were added
  around it per section rather than replacing it.

## How to deploy

Copy these two files into your repo at the same paths, overwriting the
originals:

```
frontend/src/components/Navbar.jsx
frontend/src/pages/Faq.jsx
```

Then rebuild:

```
cd frontend
npm install
npm run build
```

Build was verified locally — `npm run build` completes cleanly with no
errors, and the FAQ chunk (`Faq-*.js`) builds as expected under the existing
route-based lazy-loading setup.

## Notes / things you may want to revisit later

- The FAQ link was added to the desktop + mobile nav only (it was already
  linked from the Footer, per earlier work) — now it's discoverable in both
  places.
- If you want FAQ higher up in the nav order (e.g. before "About"), just
  reorder the entry in `NAV_LINKS` — it's a one-line change.
- Feel free to tweak which questions live in "How ArenaX Compares" — that
  section makes competitive claims (e.g. vs. Discord/Reddit) that are framed
  generally; adjust wording if you want it more/less assertive.
