import { z } from 'zod';
import { sessionStatusEnum } from './enums.validator';

// ── model DailySession (database/src/contract.prisma) ───────────────────
// Server owns: id
// Body-only schemas — pair with the validateBody middleware.

// POST /api/sessions (start a new round)
export const createDailySessionSchema = z.object({
  playerId: z.uuid('playerId must be a valid UUID'), // Player.id
  day: z.iso.datetime('Day must be an ISO 8601 datetime'),
  ordinal: z.number().int().min(1).default(1), // 1 = free play, 2+ = paid extra attempt
});

// PATCH /api/sessions/:id (finish / score the round)
export const updateDailySessionSchema = z.object({
  status: sessionStatusEnum.optional(),
  score: z.number().int().min(0).max(300).optional(), // total /300, set when finished
  finishedAt: z.iso.datetime().optional(), // all 3 movies answered → session complete
});

export type CreateDailySessionInput = z.infer<typeof createDailySessionSchema>;
export type UpdateDailySessionInput = z.infer<typeof updateDailySessionSchema>;
