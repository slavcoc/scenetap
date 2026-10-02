import { RequestHandler } from "express";
import { leaderboardService } from "../service/leaderboard.service";

export const leaderboardController = {
  get: (async (req, res) => {
    const window = req.query.window === "week" ? "week" : "today";
    const entries = await leaderboardService.get(window);
    res.json({ window, entries });
  }) as RequestHandler,
};
