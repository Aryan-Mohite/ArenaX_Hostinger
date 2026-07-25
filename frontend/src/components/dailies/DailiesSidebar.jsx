import { Spinner } from "../UI";

const FALLBACK_ICON = "/vite.svg";

export default function DailiesSidebar({ games, loading, error, selectedGameId, onSelect }) {
  return (
    <aside
      className="w-full lg:w-72 shrink-0 border-r flex flex-col"
      style={{ borderColor: "rgba(255,30,39,0.15)", background: "#0a0a0a" }}
    >
      <div className="px-5 pt-6 pb-3">
        <h2 className="text-xs font-bold tracking-[0.2em] text-gray-500 uppercase">Your Games</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-1.5">
        {loading && (
          <div className="flex justify-center py-10">
            <Spinner />
          </div>
        )}

        {!loading && error && (
          <p className="text-sm text-gray-500 px-2 py-4">Couldn't load your games. Try refreshing.</p>
        )}

        {!loading && !error && games.length === 0 && (
          <div className="px-2 py-6 text-sm text-gray-500">
            No games in your library yet.{" "}
            <a href="/games" className="underline hover:text-white">
              Add some
            </a>{" "}
            to start playing Dailies.
          </div>
        )}

        {games.map((game) => {
          const isActive = game.game_id === selectedGameId;
          return (
            <button
              key={game.game_id}
              onClick={() => onSelect(game)}
              className="w-full text-left px-3 py-2.5 rounded-md flex items-center gap-3 transition-all duration-150 group"
              style={{
                background: isActive ? "linear-gradient(90deg, rgba(255,30,39,0.16), rgba(255,30,39,0.02))" : "transparent",
                borderLeft: isActive ? "3px solid #ff1e27" : "3px solid transparent",
              }}
            >
              <div
                className="w-9 h-9 rounded-md overflow-hidden shrink-0 border"
                style={{
                  borderColor: isActive ? "rgba(255,30,39,0.5)" : "rgba(255,255,255,0.08)",
                  boxShadow: isActive ? "0 0 10px rgba(255,30,39,0.35)" : "none",
                }}
              >
                <img
                  src={game.icon || game.cover_image || FALLBACK_ICON}
                  alt=""
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = FALLBACK_ICON)}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span
                    className="text-sm font-medium truncate"
                    style={{ color: isActive ? "#fff" : "#c7c7c7" }}
                  >
                    {game.game_name}
                  </span>
                  {game.today_completed ? (
                    <span
                      className="text-[9px] font-bold px-1.5 py-[1px] rounded-full shrink-0"
                      style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80", border: "1px solid rgba(34,197,94,0.3)" }}
                    >
                      DONE
                    </span>
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ff1e27] shrink-0 animate-pulse" title="Not completed today" />
                  )}
                </div>
                {game.current_streak > 0 && (
                  <span className="text-[11px] text-gray-500">🔥 {game.current_streak}d streak</span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
