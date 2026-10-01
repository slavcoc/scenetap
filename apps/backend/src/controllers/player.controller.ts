import { RequestHandler } from "express";
import type { CreatePlayerInput } from "@shared/types";
import { playerService } from "../service/user.service";

export const playerController = {
  create: (async (req, res) => {
    const input = req.body as CreatePlayerInput;
    const player = await playerService.create(input);
    res.status(201).json({ id: "1", ...input });
  }) as RequestHandler,

  getById: (async (req, res) => {
    const { id } = req.params;
    const player = await playerService.getById(id as string);
    res.json({ id });
  }) as RequestHandler,
};