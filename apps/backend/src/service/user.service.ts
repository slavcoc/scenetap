import {db, PrismaClientKnownRequestError} from "@database";
import type { CreatePlayerInput } from "@shared/types";
import { AppError } from "../app-error";


export const playerService = {
  async create(input: CreatePlayerInput) {
    try {
      return await db.orm.public.Player.create({
          ...input, email: input.email.toLowerCase()
      });
    } catch (e) {
      // Unique constraint violation (no race condition, unlike check-then-insert)
      if (e instanceof PrismaClientKnownRequestError) {
        throw new AppError(409, "Email already in use");
      }
      throw e;
    }
  },
  async getById(id: string) {
    const user = await db.orm.public.Player.first({ id  });
    if (!user) throw new AppError(404, "User not found");
    return user;
  },
};