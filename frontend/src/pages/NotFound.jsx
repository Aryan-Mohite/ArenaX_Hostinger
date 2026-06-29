import { Link } from "react-router-dom";
import dragonBg from "../assets/notfound-dragon.jpg";

export default function NotFound() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] w-full overflow-hidden bg-black flex flex-col items-center justify-center text-center px-4">
      {/* Background artwork */}
      <img
        src={dragonBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 w-full h-full object-cover opacity-90"
      />
      {/* Darken edges for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center mt-32 sm:mt-40">
        <p className="uppercase tracking-[0.3em] text-xs sm:text-sm text-red flex items-center gap-2 font-display font-semibold">
          <span className="h-px w-6 bg-red/70" />
          Page Not Found
          <span className="h-px w-6 bg-red/70" />
        </p>

        <h1 className="font-display font-bold text-7xl sm:text-9xl text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] mt-2">
          404
        </h1>

        <p className="text-white/90 mt-4 max-w-md text-sm sm:text-base">
          The path you seek has vanished into the mist.
        </p>
        <p className="text-red font-medium mt-1 text-sm sm:text-base">
          Let&apos;s get you back in the arena.
        </p>

        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 px-8 py-3 bg-black/60 border border-red/70 text-white font-display font-semibold tracking-wide uppercase rounded-sm hover:bg-red hover:border-red transition-all duration-300 shadow-red-glow"
        >
          Return to Arena
          <span aria-hidden="true">›</span>
        </Link>
      </div>

      {/* Quote card, bottom right (hidden on small screens) */}
      <div className="hidden md:block absolute z-10 bottom-8 right-8 max-w-xs bg-black/60 border border-white/10 rounded-md p-4 text-left backdrop-blur-sm">
        <p className="text-white/80 text-xs leading-relaxed">
          “Even the strongest warriors take a wrong turn sometimes.”
        </p>
        <p className="text-red text-xs mt-1 font-medium">Rise, Refocus, Fight again.</p>
      </div>
    </div>
  );
}