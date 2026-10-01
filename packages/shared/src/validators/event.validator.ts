import { z } from 'zod';
import { eventTypeEnum } from './enums.validator';

// ── model Event (database/src/contract.prisma) ──────────────────────────
// Analytics (calibration data) — append-only, no update endpoint.
// Server owns: id, createdAt
// Body-only schemas — pair with the validateBody middleware.

// POST /api/events
export const createEventSchema = z.object({
  playerId: z.uuid('playerId must be a valid UUID'),
  day: z.iso.datetime('Day must be an ISO 8601 datetime'),
  type: eventTypeEnum,
  movieId: z.number().int().positive().optional(),
  exchangeId: z.number().int().positive().optional(),
  payload: z.json(), // e.g. reveal counts, correct/wrong, session duration, taps used
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
