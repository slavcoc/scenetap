import { Router } from "express";
import { createPlayerSchema, loginWithGoogleSchema, loginWithPasswordSchema } from "@shared/types";
import { validate } from "../middlewares/validate";
import { playerController } from "../controllers/player.controller";

export const playerRoute = Router();

playerRoute.post("/player", validate(createPlayerSchema), playerController.create);

// Auth
playerRoute.post("/login/password", validate(loginWithPasswordSchema), playerController.loginWithPassword);
playerRoute.post("/login/google", validate(loginWithGoogleSchema), playerController.loginWithGoogle);

playerRoute.get("/:id", playerController.getById);
playerRoute.delete("/:id", playerController.remove);