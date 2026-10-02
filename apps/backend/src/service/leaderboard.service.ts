import { db, Temporal } from "@database";

export type LeaderboardWindow = "today" | "week";

/** Mask emails for the public board: ke**y@example.com */
const maskEmail = (email: string | null) => {
  if (!email) return "Guest";
  const [local, domain] = email.split("@");
  if (!domain) return "Guest";
  const visible = Math.min(2, local.length);
  const last = local.length > 2 ? local.slice(-1) : "";
  return `${local.slice(0, visible)}${"*".repeat(Math.max(3, local.length - visible - last.length))}${last}@${domain}`;
};

export const leaderboardService = {
  /** Top 50 players by points won in the window (today = UTC midnight → now,
   * week = last 7 calendar days). */
  async get(window: LeaderboardWindow) {
    const now = Temporal.Now.zonedDateTimeISO("UTC");
    const start = (window === "today" ? now.startOfDay() : now.subtract({ days: 6 }).startOfDay()).toInstant();

    const grouped = await db.orm.public.DailySession
      .where((s) => s.day.gte(start))
      .groupBy("playerId")
      .aggregate((agg) => ({ points: agg.sum("score") }));

    // The ORM can't ORDER BY aggregate aliases on Postgres — sort in JS.
    // Fine at this scale (a few thousand rows/day); revisit if it grows.
    const sorted = grouped
      .map((g) => ({ playerId: g.playerId, points: g.points ?? 0 }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 50);

    const players = await db.orm.public.Player.all();
    const emailById = new Map(players.map((p) => [p.id, p.email]));

    return sorted.map((row, i) => ({
      rank: i + 1,
      player: maskEmail(emailById.get(row.playerId) ?? null),
      points: row.points,
    }));
  },
};
