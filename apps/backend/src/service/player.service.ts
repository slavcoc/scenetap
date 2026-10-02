import {db, PrismaClientKnownRequestError, Temporal} from "@database";
import type { CreatePlayerInput, LoginWithGoogleInput, LoginWithPasswordInput, SignupWithPasswordInput } from "@shared/types";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { AppError } from "../app-error";

const BCRYPT_ROUNDS = 10;

// One client per process; audience pins verification to our app.
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/** Postgres 23505 = unique_violation. The Prisma 8 ORM throws SqlQueryError for
 * these, so match on the sqlState rather than the (non-public) error class. */
const isUniqueViolation = (e: unknown) =>
  e instanceof PrismaClientKnownRequestError || (e as { sqlState?: string })?.sqlState === '23505';

export const playerService = {
  async create(input: CreatePlayerInput) {
    const { password, ...data } = input;
    try {
      return await db.orm.public.Player.create({
        ...data,
        email: input.email.toLowerCase(),
        ...(password ? { passwordHash: await bcrypt.hash(password, BCRYPT_ROUNDS) } : {}),
      });
    } catch (e) {
      // Unique constraint violation (no race condition, unlike check-then-insert)
      if (isUniqueViolation(e)) {
        throw new AppError(409, "Email already in use");
      }
      throw e;
    }
  },

  async signupWithPassword(input: SignupWithPasswordInput) {
    // Reuses create() so hashing and the 409 duplicate-email handling stay in one place.
    return playerService.create({ ...input, provider: "EMAIL" });
  },

  async loginWithPassword({ email, password }: LoginWithPasswordInput) {
    const player = await db.orm.public.Player.first({ email: email.toLowerCase() });
    // Same error for unknown email / wrong password / non-password account —
    // never reveal which one failed.
    if (!player?.passwordHash || !(await bcrypt.compare(password, player.passwordHash))) {
      throw new AppError(401, "Invalid email or password");
    }
    await db.orm.public.Player.where({ id: player.id }).update({ lastSeenAt: Temporal.Now.instant() });
    return player;
  },

  async loginWithGoogle({ idToken }: LoginWithGoogleInput) {
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (e) {
      throw new AppError(401, "Invalid Google token");
    }
    const email = payload?.email?.toLowerCase();
    if (!email) throw new AppError(401, "Google token has no verified email");

    const existing = await db.orm.public.Player.first({ email });
    if (existing) {
      await db.orm.public.Player.where({ id: existing.id }).update({ lastSeenAt: Temporal.Now.instant() });
      return existing;
    }
    // Create on first Google sign-in; if a concurrent request won the race,
    // fall back to the existing row instead of erroring.
    try {
      return await db.orm.public.Player.create({ email, provider: "GOOGLE" });
    } catch (e) {
      if (isUniqueViolation(e)) {
        const raced = await db.orm.public.Player.first({ email });
        if (!raced) throw new AppError(409, "Email already in use");
        return raced;
      }
      throw e;
    }
  },

  async getById(id: string) {
    const user = await db.orm.public.Player.first({ id  });
    if (!user) throw new AppError(404, "User not found");
    return user;
  },
  async delete(id: string) {
    const deleted = await db.orm.public.Player.where({ id }).delete();
    if (!deleted) throw new AppError(404, "User not found");
    return deleted;
  },
};
