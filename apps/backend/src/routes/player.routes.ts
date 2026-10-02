import { Router } from "express";
import {
  createPlayerSchema,
  loginWithGoogleSchema,
  loginWithPasswordSchema,
  signupWithPasswordSchema,
} from "@shared/types";
import { validate } from "../middlewares/validate";
import { playerController } from "../controllers/player.controller";

export const playerRoute = Router();

playerRoute.post("/player", validate(createPlayerSchema), playerController.create);

// Sign up
playerRoute.post("/signup/email", validate(signupWithPasswordSchema), playerController.signupWithPassword);
playerRoute.post("/signup/google", validate(loginWithGoogleSchema), playerController.loginWithGoogle);

// Log in
playerRoute.post("/login/password", validate(loginWithPasswordSchema), playerController.loginWithPassword);
playerRoute.post("/login/google", validate(loginWithGoogleSchema), playerController.loginWithGoogle);

playerRoute.get("/:id", playerController.getById);
playerRoute.delete("/:id", playerController.remove);