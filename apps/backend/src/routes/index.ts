import { Router } from "express";
import { userRoutes } from "./player.routes";

export const routes = Router();
routes.use("/users", userRoutes);