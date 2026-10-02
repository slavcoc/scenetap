import { Router } from "express";
import { playerRoute } from "./player.routes";
import { leaderboardRoute } from "./leaderboard.routes";

export const routes = Router();
routes.use("/users", playerRoute);
routes.use("/leaderboard", leaderboardRoute);