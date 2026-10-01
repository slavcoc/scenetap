import { Router } from "express";
import { createPlayerSchema } from "@shared/types";
import { validate } from "../middlewares/validate";
import { playerController } from "../controllers/player.controller";

export const playerRoute = Router();

playerRoute.post("/player", validate(createPlayerSchema), playerController.create);