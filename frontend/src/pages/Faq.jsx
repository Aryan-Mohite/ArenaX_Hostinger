import { useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";

const FAQS = [
  {
    q: "What is ArenaX?",
    a: "ArenaX is an all-in-one esports platform for competitive FPS players. It brings together tournaments, a team finder, live streaming, and a community hub (The Nexus) in one place, so you don't need separate tools to compete, find teammates, and watch matches.",
  },
  {
    q: "Is ArenaX free to use?",
    a: "Yes. Creating an account, browsing tournaments, using the team finder, and watching streams on ArenaX is free. Some tournaments may have entry requirements set by their organizers (such as rank gates or prize-pool buy-ins), but the platform itself doesn't charge to join.",
  },
  {
    q: "Which games does ArenaX support?",
    a: "ArenaX currently focuses on competitive FPS titles, with Valorant as a primary supported game. Check the Game Library page for the full, up-to-date list of supported titles — new games are added as the platform grows.",
  },
  {
    q: "How do I join a tournament on ArenaX?",
    a: "Go to The Arena, browse open tournaments, and check the entry requirements and bracket format. If you have a full team, register together; if not, use TeamUP Arena to find teammates first. Registration closes before brackets are seeded, so register early.",
  },
  {
    q: "How do I find teammates on ArenaX?",
    a: "Use TeamUP Arena (the team finder) to browse open squads or post your own listing. You can filter by game, rank, role, and play style to find players who match how you want to compete.",
  },
  {
    q: "Can I stream my matches on ArenaX?",
    a: "Yes — the Spectate feature lets you go live directly from the platform with one click, no separate streaming account or manual RTMP setup required. Other community members can then discover and watch your stream.",
  },
  {
    q: "Does ArenaX sell or share my data?",
    a: "No. ArenaX does not sell user profiles or gameplay data to third parties. For full details on what's collected and how it's used, see our Privacy Policy.",
  },
  {
    q: "What tournament formats does ArenaX use?",
    a: "It depends on the specific tournament — organizers can run single elimination, double elimination, or Swiss-style brackets. The format is always listed on the tournament's page before you register, so check it before committing your team.",
  },
  {
    q: "Is ArenaX available worldwide?",
    a: "Yes, ArenaX is open to players globally. Tournament availability and regional brackets depend on what organizers set up, so check each tournament's region setting before registering.",
  },
  {
    q: "How do I contact ArenaX support?",
    a: "Email support@arenax.io for account or platform issues. You can also reach the team through ArenaX's social channels linked in the site footer.",
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  return (
    <div className="card !p-0 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4"
        aria-expanded={isOpen}
      >
        <span className="font-display font-semibold text-white text-base">
          {item.q}
        </span>
        <span
          className="shrink-0 text-xl text-gray-400 transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </button>
      {isOpen && (
        <div className="px-5 pb-5 text-sm text-gray-400 leading-relaxed">
          {item.a}
        </div>
      )}
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <div className="min-h-screen">
      <SEO
        title="Frequently Asked Questions"
        description="Answers to common questions about ArenaX — tournaments, team finding, streaming, pricing, and supported games."
        path="/faq"
        jsonLd={jsonLd}
      />

      <section className="relative overflow-hidden py-20 px-4">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 50%, #ff465508 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #ff465505 0%, transparent 50%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto text-center">
          <span className="badge-red mb-6 inline-flex">
            <span className="w-1.5 h-1.5 rounded-full bg-red-light animate-pulse" />
            Help Center
          </span>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white leading-tight mb-4">
            Frequently asked <span style={{ color: "#ff4655" }}>questions</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            Can't find what you're looking for?{" "}
            <a
              href="mailto:support@arenax.io"
              className="underline hover:text-white transition-colors"
            >
              Email support@arenax.io
            </a>
            .
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 pb-24 space-y-3">
        {FAQS.map((item, i) => (
          <FaqItem
            key={item.q}
            item={item}
            isOpen={openIndex === i}
            onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
          />
        ))}

        <div className="text-center pt-8">
          <Link to="/about" className="btn-secondary">
            Learn more about ArenaX
          </Link>
        </div>
      </section>
    </div>
  );
}
