import { createContext, useContext, useRef, useState, useCallback } from "react";
import gsap from "gsap";

const DailiesTransitionContext = createContext(null);

/**
 * Wraps the app so any component can call `triggerTransition(navigate)` to
 * play the "Trigger -> Overlay -> Target Entry" glitch/wipe sequence from
 * the Dailies spec before the route actually changes underneath it.
 */
export function DailiesTransitionProvider({ children }) {
  const [active, setActive] = useState(false);
  const overlayRef = useRef(null);
  const barsRef = useRef([]);

  const triggerTransition = useCallback((onMidpoint) => {
    setActive(true);

    // Wait one tick for the overlay to mount before animating it.
    requestAnimationFrame(() => {
      const overlay = overlayRef.current;
      const bars = barsRef.current.filter(Boolean);
      if (!overlay) {
        onMidpoint?.();
        setActive(false);
        return;
      }

      const tl = gsap.timeline({
        onComplete: () => setActive(false),
      });

      // Trigger + overlay phase: angled slash bars sweep in from alternating
      // sides with a red glow, staggered slightly for a "slicing" feel.
      tl.set(overlay, { opacity: 1 });
      tl.fromTo(
        bars,
        { xPercent: (i) => (i % 2 === 0 ? -120 : 120), opacity: 0 },
        { xPercent: 0, opacity: 1, duration: 0.28, ease: "power3.out", stagger: 0.04 }
      );
      tl.to(overlay, { duration: 0.05 }); // beat before the actual route swap
      tl.call(() => onMidpoint?.());
      // Target entry phase: hold briefly so the new route can mount behind
      // the overlay, then wipe the bars back out and fade.
      tl.to({}, { duration: 0.18 });
      tl.to(
        bars,
        { xPercent: (i) => (i % 2 === 0 ? 120 : -120), opacity: 0, duration: 0.32, ease: "power2.inOut", stagger: 0.03 },
        ">"
      );
      tl.to(overlay, { opacity: 0, duration: 0.15 }, "-=0.1");
    });
  }, []);

  return (
    <DailiesTransitionContext.Provider value={{ triggerTransition }}>
      {children}
      {active && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[9999] pointer-events-none overflow-hidden"
          style={{ opacity: 0, background: "rgba(0,0,0,0.55)" }}
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              ref={(el) => (barsRef.current[i] = el)}
              className="absolute top-0 h-full"
              style={{
                left: `${i * 22}%`,
                width: "18%",
                transform: "skewX(-12deg)",
                background:
                  "linear-gradient(180deg, rgba(255,30,39,0.05) 0%, rgba(255,30,39,0.35) 50%, rgba(255,30,39,0.05) 100%)",
                boxShadow: "0 0 40px 6px rgba(255,30,39,0.45)",
                borderLeft: "1px solid rgba(255,90,95,0.6)",
                borderRight: "1px solid rgba(255,90,95,0.6)",
              }}
            />
          ))}
        </div>
      )}
    </DailiesTransitionContext.Provider>
  );
}

export const useDailiesTransition = () => useContext(DailiesTransitionContext);
