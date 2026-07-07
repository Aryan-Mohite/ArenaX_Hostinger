# ArenaX — Site Title Update

**New title:** `ArenaX — Free Esports Tournaments & Team Finder Platform`

This package updates the site title everywhere it's rendered for SEO/search
and social sharing. Old title being replaced:
`ArenaX — Compete. Conquer. Connect. — Prove It | ArenaX`

## Files changed (paths mirror the repo)

### `frontend/index.html`
- `<title>` tag
- `og:title` meta tag
- `twitter:title` meta tag

(The static `<!-- FIX 1 -->` comment mentioning the old title was left as-is —
it's just a historical code comment, not rendered content. The og:image:alt
text and the `<h1>` inside the `<noscript>` GEO/LLM block still use the
brand tagline "ArenaX — Compete. Conquer. Connect." since that's brand
voice/tagline copy, not the page title — let me know if you want those
changed too.)

### `frontend/src/components/SEO.jsx`
- Updated the fallback/default title used by every page that doesn't pass
  an explicit `title` prop to `<SEO />`. This is the single source of truth
  for the default title across the whole SPA.

### `frontend/src/pages/Home.jsx`
- Removed the homepage's explicit `title` override on `<SEO />` so it now
  inherits the new default title from `SEO.jsx` instead of carrying a
  duplicate hardcoded copy of the old title.

### `frontend/public/manifest.json`
- Updated the PWA `name` field (shown when the site is installed to a
  home screen) to match the new title.

### `src/app.js`
- Updated the `# ArenaX — ...` heading in the `/llms.txt` route (the
  GEO/AI-crawler summary file) to match the new title.

## Verified
- `npm run build` in `frontend/` completed successfully with no errors.
- `manifest.json` validated as well-formed JSON.

## Deploy
Copy these files into their matching paths in your repo, overwriting the
existing versions, then redeploy as usual on Hostinger.
