import { z } from 'zod';
import { authProviderEnum } from './enums.validator';

// ── model Player (database/src/contract.prisma) ─────────────────────────
// Server owns: id, createdAt, lastSeenAt
// Body-only schemas — pair with the validateBody middleware.

// POST /api/players (guest registration / sign-in)
export const createPlayerSchema = z.object({
  email: z.email('Invalid email address'),
  provider: authProviderEnum.default('GUEST'),
  timezone: z.string().trim().min(1).default('UTC'),
});

// PATCH /api/players/:id
export const updatePlayerSchema = z.object({
  email: z.email('Invalid email address'),
  provider: authProviderEnum.optional(),
  timezone: z.string().trim().min(1).optional(),
});

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
