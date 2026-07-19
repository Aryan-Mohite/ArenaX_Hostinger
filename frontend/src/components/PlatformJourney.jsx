import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── The four real pillars of the platform ──────────────────────────────────
const STEPS = [
  {
    n: "01",
    title: "Build your profile",
    copy: "Link your Valorant, Steam, Riot, or BGMI ID once — it shows up on your profile and your team's roster.",
    to: "/profile",
  },
  {
    n: "02",
    title: "Find your squad",
    copy: "Post or apply to TeamFinder listings and chat with recruits directly, no Discord required.",
    to: "/teamfinder",
  },
  {
    n: "03",
    title: "Join a tournament",
    copy: "Register your team, get your match schedule, and compete for real prize pools.",
    to: "/tournament",
  },
  {
    n: "04",
    title: "Go live on Spectre",
    copy: "Follow the matches and creators you care about, streamed straight from the source.",
    to: "/stream",
  },
];

export default function PlatformJourney() {
  const sectionRef = useRef(null);
  const fillRef = useRef(null);
  const nodeRefs = useRef([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion) return;

      ScrollTrigger.matchMedia({
        // ── Desktop: pin the section, draw the rail, light up each node ──
        "(min-width: 900px)": () => {
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: sectionRef.current,
              start: "top top",
              end: "+=100%",
              scrub: 1,
              pin: true,
            },
          });

          tl.fromTo(
            fillRef.current,
            { scaleX: 0 },
            { scaleX: 1, ease: "none", duration: 1 },
            0,
          );

          STEPS.forEach((_, i) => {
            const pos = STEPS.length > 1 ? i / (STEPS.length - 1) : 0;
            tl.to(
              nodeRefs.current[i],
              {
                backgroundColor: "#ff4655",
                borderColor: "#ff4655",
                color: "#ffffff",
                scale: 1.12,
                duration: 0.001,
              },
              pos,
            );
          });
        },

        // ── Mobile: simple staggered reveal, no pin ──
        "(max-width: 899px)": () => {
          gsap.utils.toArray(".pj-step").forEach((step) => {
            gsap.from(step, {
              opacity: 0,
              y: 24,
              duration: 0.7,
              ease: "power2.out",
              scrollTrigger: { trigger: step, start: "top 88%" },
            });
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative py-16 md:py-0 md:min-h-[70vh] md:flex md:items-center overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-14 md:mb-16">
          <span className="badge-red inline-flex">How it works</span>
          <h2 className="font-display font-bold text-3xl md:text-4xl mt-4 text-theme-primary">
            From sign-up to the scoreboard
          </h2>
          <p className="text-theme-secondary mt-2 max-w-md mx-auto text-sm md:text-base">
            Everything you need to compete lives in ArenaX — four steps, no
            Discord required.
          </p>
        </div>

        <div className="relative">
          {/* Connecting rail — desktop only */}
          <div
            className="hidden md:block absolute top-6 left-[12%] right-[12%] h-[2px] border-theme"
            style={{ background: "var(--border-color)" }}
          />
          <div
            ref={fillRef}
            className="hidden md:block absolute top-6 left-[12%] right-[12%] h-[2px] origin-left"
            style={{
              transform: "scaleX(0)",
              background: "linear-gradient(to right, var(--red), var(--red-light))",
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-6 relative">
            {STEPS.map((s, i) => (
              <Link
                to={s.to}
                key={s.n}
                className="pj-step group flex flex-col items-center text-center md:items-start md:text-left"
              >
                <div
                  ref={(el) => (nodeRefs.current[i] = el)}
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-display font-bold text-sm mb-4 shrink-0"
                  style={{
                    borderColor: "var(--border-color)",
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {s.n}
                </div>
                <h3 className="font-display font-semibold text-lg text-theme-primary">
                  {s.title}
                </h3>
                <p className="text-sm text-theme-secondary mt-1.5 leading-relaxed">
                  {s.copy}
                </p>
                <span
                  className="mt-3 text-xs font-semibold inline-flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-0.5"
                  style={{ color: "var(--red)" }}
                >
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
