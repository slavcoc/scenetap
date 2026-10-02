import { Router } from "express";
import { playerRoute } from "./player.routes";

export const routes = Router();
routes.use("/users", playerRoute);