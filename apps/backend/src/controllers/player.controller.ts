import { RequestHandler } from "express";
import type { CreatePlayerInput, LoginWithGoogleInput, LoginWithPasswordInput, SignupWithPasswordInput } from "@shared/types";
import { playerService } from "../service/player.service";

/** Remove fields that must never leave the server (e.g. bcrypt hash). */
const safePlayer = <T extends { passwordHash?: string | null }>({ passwordHash: _hash, ...player }: T) => player;

export const playerController = {
  create: (async (req, res) => {
    const input = req.body as CreatePlayerInput;
    const player = await playerService.create(input);
    res.status(201).json(safePlayer(player));
  }) as RequestHandler,

  signupWithPassword: (async (req, res) => {
    const input = req.body as SignupWithPasswordInput;
    const player = await playerService.signupWithPassword(input);
    res.status(201).json(safePlayer(player));
  }) as RequestHandler,

  loginWithPassword: (async (req, res) => {
    const input = req.body as LoginWithPasswordInput;
    const player = await playerService.loginWithPassword(input);
    res.json(safePlayer(player));
  }) as RequestHandler,

  loginWithGoogle: (async (req, res) => {
    const input = req.body as LoginWithGoogleInput;
    const player = await playerService.loginWithGoogle(input);
    res.json(safePlayer(player));
  }) as RequestHandler,

  getById: (async (req, res) => {
    const { id } = req.params;
    const player = await playerService.getById(id as string);
    res.json(safePlayer(player));
  }) as RequestHandler,

  remove: (async (req, res) => {
    const { id } = req.params;
    await playerService.delete(id as string);
    res.status(204).end();
  }) as RequestHandler,
};
