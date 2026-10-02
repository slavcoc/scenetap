import { request } from "./http";

export type LeaderboardWindow = "today" | "week";

export type LeaderboardEntry = {
  rank: number;
  player: string;
  points: number;
};

export type LeaderboardResponse = {
  window: LeaderboardWindow;
  entries: LeaderboardEntry[];
};

export const leaderboardService = {
  /** GET /leaderboard?window=today|week — top 50 by points */
  get: (window: LeaderboardWindow) =>
    request<LeaderboardResponse>(`/leaderboard?window=${window}`),
};
