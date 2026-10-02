import { Router } from "express";
import { leaderboardController } from "../controllers/leaderboard.controller";

export const leaderboardRoute = Router();

// GET /leaderboard?window=today|week
leaderboardRoute.get("/", leaderboardController.get);
