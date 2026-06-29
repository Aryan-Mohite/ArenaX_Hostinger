import { Link } from "react-router-dom";
import dragonBg from "../assets/notfound-dragon.jpg";

// Fixed set of falling petal/ember particles — varied size, position, speed, delay.
const PARTICLES = [
  { left: "4%",  size: 10, duration: 14, delay: 0 },
  { left: "11%", size: 7,  duration: 18, delay: 2 },
  { left: "19%", size: 9,  duration: 16, delay: 5 },
  { left: "27%", size: 6,  duration: 20, delay: 1 },
  { left: "35%", size: 8,  duration: 15, delay: 4 },
  { left: "47%", size: 5,  duration: 19, delay: 3 },
  { left: "58%", size: 9,  duration: 17, delay: 6 },
  { left: "67%", size: 7,  duration: 14, delay: 2.5 },
  { left: "75%", size: 10, duration: 21, delay: 0.5 },
  { left: "83%", size: 6,  duration: 16, delay: 4.5 },
  { left: "90%", size: 8,  duration: 18, delay: 1.5 },
  { left: "96%", size: 7,  duration: 15, delay: 3.5 },
];

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black flex items-end justify-center">
      {/* Background artwork — slow Ken Burns zoom */}
      <div className="absolute inset-0 nf-kenburns">
        <img
          src={dragonBg}
          alt="Page not found"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Pulsing glow over the dragon's eyes */}
      <span className="nf-eye-glow" style={{ left: "47%", top: "21%" }} />
      <span className="nf-eye-glow" style={{ left: "53.5%", top: "21%", animationDelay: "0.4s" }} />

      {/* Falling red petals / embers */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="nf-petal"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Return button */}
      <Link
        to="/"
        className="relative z-10 mb-24 sm:mb-28 inline-flex items-center gap-2 px-8 py-3 bg-black/60 border border-red/70 text-white font-display font-semibold tracking-wide uppercase rounded-sm hover:bg-red hover:border-red transition-all duration-300 shadow-red-glow"
      >
        Return to Arena
        <span aria-hidden="true">›</span>
      </Link>

      <style>{`
        .nf-kenburns img {
          animation: nfZoom 22s ease-in-out infinite alternate;
          transform-origin: 50% 35%;
        }
        @keyframes nfZoom {
          0%   { transform: scale(1); }
          100% { transform: scale(1.08); }
        }

        .nf-eye-glow {
          position: absolute;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255,40,55,0.95) 0%, rgba(255,40,55,0.5) 40%, transparent 75%);
          box-shadow: 0 0 12px 4px rgba(255,40,55,0.6);
          transform: translate(-50%, -50%);
          z-index: 5;
          animation: nfPulse 2.4s ease-in-out infinite;
        }
        @keyframes nfPulse {
          0%, 100% { opacity: 0.55; box-shadow: 0 0 8px 3px rgba(255,40,55,0.45); }
          50%      { opacity: 1;    box-shadow: 0 0 22px 8px rgba(255,40,55,0.85); }
        }

        .nf-petal {
          position: absolute;
          top: -5%;
          background: linear-gradient(135deg, #ff4655, #cc2233);
          border-radius: 60% 0 60% 0;
          opacity: 0.85;
          animation-name: nfFall;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
        }
        @keyframes nfFall {
          0%   { transform: translateY(0) rotate(0deg);    opacity: 0; }
          8%   { opacity: 0.85; }
          92%  { opacity: 0.85; }
          100% { transform: translateY(110vh) rotate(280deg); opacity: 0; }
        }

        @media (prefers-reduced-motion: reduce) {
          .nf-kenburns img, .nf-eye-glow, .nf-petal {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}