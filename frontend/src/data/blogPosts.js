// ── Blog content ─────────────────────────────────────────────────────────────
// Static for now (no CMS/DB table yet). Each post is plain content blocks so
// BlogPost.jsx can render it without a markdown dependency.
//
// To add a new post: append an object below, then add its slug to the
// BLOG_SLUGS list in src/app.js (backend) so it appears in sitemap.xml.
//
// IMPORTANT: keep `slug` values in sync with backend/src/app.js BLOG_SLUGS —
// the sitemap route reads a hardcoded copy since the backend can't import
// frontend source.

const BLOG_POSTS = [
  {
    slug: "how-to-join-valorant-tournaments-online",
    title: "How to Join Valorant Tournaments Online: A Beginner's Guide",
    excerpt:
      "New to competitive Valorant? Here's exactly how to find, register for, and prepare for your first online tournament — no prior experience required.",
    coverEmoji: "🏆",
    date: "2026-04-02",
    author: "ArenaX Team",
    readTime: "5 min read",
    tags: ["Valorant", "Tournaments", "Guide"],
    content: [
      {
        type: "p",
        text: "If you've been grinding ranked and want to test yourself against real competition, online tournaments are the natural next step. Here's how to get started on ArenaX without getting overwhelmed.",
      },
      {
        type: "h2",
        text: "1. Find a tournament that matches your level",
      },
      {
        type: "p",
        text: "Head to the Arena and filter by game (Valorant), entry requirements, and prize pool. Most platforms — ArenaX included — run a mix of open brackets for newer players and ranked-gated brackets for more experienced squads. Don't jump straight into the highest-stakes bracket; build tournament experience first.",
      },
      {
        type: "h2",
        text: "2. Get your squad locked in",
      },
      {
        type: "p",
        text: "Most Valorant tournaments run 5v5. If you don't have a full roster, use a team finder to fill the remaining slots — filter by rank and role so you're not pairing a Radiant duelist with a Bronze support and hoping for the best.",
      },
      {
        type: "h2",
        text: "3. Register before the cutoff",
      },
      {
        type: "p",
        text: "Registration windows close before brackets are seeded, so don't wait until match day. Double-check your team's roster is finalized in-platform, since most organizers lock substitutions once the bracket is generated.",
      },
      {
        type: "h2",
        text: "4. Show up early on match day",
      },
      {
        type: "p",
        text: "Lobbies usually open 10–15 minutes before the scheduled match time. Arrive early, confirm your custom game code or lobby link, and have a backup communication channel (Discord) in case in-platform chat has issues.",
      },
      {
        type: "h2",
        text: "5. Review your VOD afterward",
      },
      {
        type: "p",
        text: "Win or lose, the fastest way to improve is reviewing your own matches. Look for recurring mistakes in positioning, utility usage, or economy management before your next bracket.",
      },
    ],
  },
  {
    slug: "finding-the-right-teammates-fps-games",
    title: "Finding the Right Teammates for Competitive FPS Games",
    excerpt:
      "Solo queue only gets you so far. Here's how to evaluate potential teammates so you build a squad that actually sticks together.",
    coverEmoji: "🤝",
    date: "2026-04-16",
    author: "ArenaX Team",
    readTime: "4 min read",
    tags: ["Team Finder", "FPS", "Community"],
    content: [
      {
        type: "p",
        text: "A good teammate isn't just someone who matches your rank — communication style, availability, and goals matter just as much. Here's what to actually screen for.",
      },
      {
        type: "h2",
        text: "Match availability before skill",
      },
      {
        type: "p",
        text: "A Radiant player who's only free on weekends is less useful to a team that scrims on weekday evenings than a slightly lower-ranked player who's consistently online. Sort by schedule overlap first.",
      },
      {
        type: "h2",
        text: "Look for role flexibility",
      },
      {
        type: "p",
        text: "Teams with five players who only want to play one role tend to fall apart during champion/agent select. Prioritize teammates who list a primary and secondary role.",
      },
      {
        type: "h2",
        text: "Run a trial scrim before committing",
      },
      {
        type: "p",
        text: "Before locking in a roster for a tournament, play a few unranked or custom games together. Communication under pressure reveals more about team chemistry than any profile bio.",
      },
      {
        type: "h2",
        text: "Use a dedicated team finder, not just Discord servers",
      },
      {
        type: "p",
        text: "Open Discord servers are noisy and hard to filter. A structured team finder — like the one built into ArenaX — lets you filter by game, rank, role, and region in seconds.",
      },
    ],
  },
  {
    slug: "building-a-streaming-setup-on-a-budget",
    title: "Building a Streaming Setup on a Budget",
    excerpt:
      "You don't need a $2,000 rig to start streaming your matches. Here's a realistic starter setup that won't break the bank.",
    coverEmoji: "📡",
    date: "2026-05-04",
    author: "ArenaX Team",
    readTime: "6 min read",
    tags: ["Streaming", "Setup", "Guide"],
    content: [
      {
        type: "p",
        text: "Streaming gear gets marketed like you need a studio. In reality, most successful new streamers start with the basics and upgrade gradually as their audience grows.",
      },
      {
        type: "h2",
        text: "What actually matters first",
      },
      {
        type: "p",
        text: "Stable internet and a clean audio source matter more than camera quality. Viewers will tolerate a basic webcam far longer than they'll tolerate choppy audio or constant buffering.",
      },
      {
        type: "h2",
        text: "Encoding: software vs hardware",
      },
      {
        type: "p",
        text: "If your GPU supports NVENC (most modern Nvidia cards do), use hardware encoding so your CPU isn't fighting your game for resources. This alone fixes most frame-drop complaints from new streamers.",
      },
      {
        type: "h2",
        text: "Go live on ArenaX",
      },
      {
        type: "p",
        text: "Once your setup is stable, going live through ArenaX's Spectate feature takes one click — no separate platform account or RTMP configuration headaches required.",
      },
    ],
  },
  {
    slug: "understanding-tournament-formats-explained",
    title: "Tournament Formats Explained: Single Elimination vs Double Elimination vs Swiss",
    excerpt:
      "Not all brackets are built the same. Understanding the format before you register changes how you should approach the whole tournament.",
    coverEmoji: "⚔️",
    date: "2026-05-20",
    author: "ArenaX Team",
    readTime: "5 min read",
    tags: ["Tournaments", "Esports 101"],
    content: [
      {
        type: "p",
        text: "Tournament format determines how much margin for error you have — and how you should pace your team's energy across the event.",
      },
      {
        type: "h2",
        text: "Single elimination",
      },
      {
        type: "p",
        text: "Lose once, you're out. Fast to run, high stakes from match one. Good for short events, brutal if your team is still finding its rhythm.",
      },
      {
        type: "h2",
        text: "Double elimination",
      },
      {
        type: "p",
        text: "One loss drops you to a losers' bracket instead of eliminating you outright. This format rewards consistency over a long event and gives room to recover from an early upset.",
      },
      {
        type: "h2",
        text: "Swiss format",
      },
      {
        type: "p",
        text: "Teams are paired against opponents with similar records each round rather than a fixed bracket. It's increasingly popular for larger online tournaments because it guarantees every team plays multiple matches regardless of an early loss.",
      },
      {
        type: "h2",
        text: "Why this matters before you register",
      },
      {
        type: "p",
        text: "Check the format on the tournament page before committing — it should shape how cautiously (or aggressively) your team plays the opening rounds.",
      },
    ],
  },
]

export function getAllPosts() {
  return [...BLOG_POSTS].sort((a, b) => new Date(b.date) - new Date(a.date));
}

export function getPostBySlug(slug) {
  return BLOG_POSTS.find((p) => p.slug === slug) || null;
}

export default BLOG_POSTS;
