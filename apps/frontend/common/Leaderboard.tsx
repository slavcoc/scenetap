"use client";

import { useEffect, useState } from "react";
import { LeaderboardEntry, LeaderboardWindow, leaderboardService } from "@/service/leaderboard.service";

/** Shown only when the backend is unreachable — clearly labeled as sample data. */
const SAMPLE_BOARD: Record<LeaderboardWindow, LeaderboardEntry[]> = {
  today: [
    { rank: 1, player: "cinephile42", points: 300 },
    { rank: 2, player: "ma***n@gmail.com", points: 285 },
    { rank: 3, player: "reel_deal", points: 270 },
    { rank: 4, player: "po***s@yahoo.com", points: 255 },
    { rank: 5, player: "Guest", points: 240 },
  ],
  week: [
    { rank: 1, player: "reel_deal", points: 1950 },
    { rank: 2, player: "cinephile42", points: 1885 },
    { rank: 3, player: "ma***n@gmail.com", points: 1740 },
    { rank: 4, player: "film_noir_fan", points: 1690 },
    { rank: 5, player: "Guest", points: 1580 },
  ],
};

export function Leaderboard() {
  const [window, setWindow] = useState<LeaderboardWindow>("today");
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [live, setLive] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await leaderboardService.get(window);
        if (cancelled) return;
        setEntries(data.entries);
        setLive(true);
      } catch {
        if (cancelled) return;
        setEntries(SAMPLE_BOARD[window]);
        setLive(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [window]);

  const rows = entries ?? SAMPLE_BOARD[window];

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/60 p-8 backdrop-blur">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold">Points board</h3>
        <div className="grid grid-cols-2 rounded-xl bg-zinc-800/70 p-1 text-sm font-medium" role="tablist">
          {(["today", "week"] as const).map((w) => (
            <button
              key={w}
              role="tab"
              aria-selected={window === w}
              onClick={() => setWindow(w)}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                window === w ? "bg-zinc-950 text-amber-300" : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {w === "today" ? "Today" : "Last 7 days"}
            </button>
          ))}
        </div>
      </div>

      {!live && (
        <p className="mb-4 rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs text-amber-200/90">
          Sample data — couldn&apos;t reach the API. Start the backend to see the live board.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="py-8 text-center text-sm text-zinc-500">
          No scores yet — be the first on the board.
        </p>
      ) : (
        <ol className="space-y-1">
          {rows.map((r) => (
            <li key={r.rank} className="flex items-center gap-4 rounded-xl px-4 py-2.5 odd:bg-white/[.03]">
              <span
                className={`w-7 text-center font-mono text-sm font-semibold ${
                  r.rank === 1 ? "text-amber-300" : r.rank <= 3 ? "text-zinc-200" : "text-zinc-500"
                }`}
              >
                {r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : r.rank}
              </span>
              <span className="flex-1 truncate text-sm text-zinc-300">{r.player}</span>
              <span className="font-mono text-sm font-semibold text-amber-300">{r.points} pts</span>
            </li>
          ))}
        </ol>
      )}
      <p className="mt-4 text-center text-xs text-zinc-600">Top 50 · max 300 pts/day · 🟢 ≥85 🟡 55–84 🔴 &lt;55</p>
    </div>
  );
}
