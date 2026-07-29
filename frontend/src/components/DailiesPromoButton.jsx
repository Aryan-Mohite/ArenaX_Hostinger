import { useNavigate } from "react-router-dom";
import { useDailiesTransition } from "./dailies/DailiesTransition";

// Lives on the Homepage — Dailies was removed from the main nav, so this is
// now the primary entry point into the daily quiz. Reuses the same
// glitch/wipe transition the old nav link used to trigger.
export default function DailiesPromoButton() {
  const navigate = useNavigate();
  const { triggerTransition } = useDailiesTransition();

  const handleClick = (e) => {
    e.preventDefault();
    triggerTransition(() => navigate("/dailies"));
  };

  return (
    <div className="card flex flex-col sm:flex-row items-center justify-between gap-4 !py-5">
      <div className="flex items-center gap-3">
        <span className="text-3xl">🧠</span>
        <div>
          <p className="font-display font-bold text-white">
            Today's Dailies quiz is live
          </p>
          <p className="text-xs text-gray-400">
            5 questions, one shot a day — test your game knowledge.
          </p>
        </div>
      </div>

      <button
        onClick={handleClick}
        className="btn-primary shadow-red-glow !px-6 !py-2.5 rounded-full whitespace-nowrap"
      >
        Play Dailies
      </button>
    </div>
  );
}
