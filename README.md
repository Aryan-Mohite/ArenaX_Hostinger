# Round 4 — FAQ + Blog + Home.jsx SEO fix

## What's in this package
Drop these files into the matching paths in your repo (overwrite existing ones), then commit/push and redeploy as usual.

NEW files:
- `frontend/src/pages/Faq.jsx` — FAQ page with accordion UI + FAQPage JSON-LD schema (10 Q&As)
- `frontend/src/pages/Blog.jsx` — Blog listing page
- `frontend/src/pages/BlogPost.jsx` — Blog post detail page + BlogPosting JSON-LD schema
- `frontend/src/data/blogPosts.js` — Static blog content (4 starter posts, edit/add freely)

MODIFIED files:
- `frontend/src/App.jsx` — added routes: `/faq`, `/blog`, `/blog/:slug`
- `frontend/src/components/Footer.jsx` — added Blog/FAQ links next to Terms/Privacy
- `frontend/src/components/SEO.jsx` — added optional `jsonLd` prop so any page can inject structured data
- `frontend/src/pages/Home.jsx` — was missing `<SEO />` entirely; now has explicit title/description/canonical
- `src/app.js` — sitemap.xml now includes `/faq`, `/blog`, and all 4 blog post URLs

## Deploy steps
1. Copy these files over their counterparts in `ArenaX_Hostinger/`.
2. `cd frontend && npm install && npm run build` (already verified clean — 142 modules, no errors).
3. Restart/redeploy the Express backend (`src/app.js` changed — sitemap route).
4. Verify:
   - `https://arenax.io/faq` and `https://arenax.io/blog` load and have correct `<title>`/meta in page source
   - `https://arenax.io/sitemap.xml` includes the new URLs
   - Run the homepage through SEOptimer/Google Rich Results Test to confirm `FAQPage` schema validates

## Notes
- Blog content is static (no DB/CMS) — to add a new post: append an object to `blogPosts.js`, then add its `slug` to the `BLOG_SLUGS` array near the top of the sitemap route in `src/app.js` so it gets indexed. Both files have comments pointing this out.
- FAQ content lives directly in `Faq.jsx` (`FAQS` array) — easy to edit without touching layout code.
- Neither page was added to the main Navbar (kept at 7 links to avoid clutter) — both are linked from the Footer instead. Say the word if you'd rather have them in the Navbar too.
- This does NOT fix the CSR/prerendering gap — that's still the top-priority structural item from before. FAQ/Blog content helps regardless, but Googlebot will still need either prerender.io or SSR to reliably index the rest of the SPA.
