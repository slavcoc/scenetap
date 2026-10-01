import { z } from 'zod';

// ── model ScheduleEntry (database/src/contract.prisma) ──────────────────
// Server owns: id
// Body-only schemas — pair with the validateBody middleware.

// POST /api/schedule
export const createScheduleEntrySchema = z.object({
  day: z.iso.datetime('Day must be an ISO 8601 datetime'), // player-local midnight for the day flip
  position: z.number().int().min(1).max(3), // slot 1–3
  movieId: z.number().int().positive('movieId must be a positive integer'), // unique: a movie is scheduled exactly once
});

// PATCH /api/schedule/:id
export const updateScheduleEntrySchema = z.object({
  day: z.iso.datetime().optional(),
  position: z.number().int().min(1).max(3).optional(),
  movieId: z.number().int().positive().optional(),
});

export type CreateScheduleEntryInput = z.infer<typeof createScheduleEntrySchema>;
export type UpdateScheduleEntryInput = z.infer<typeof updateScheduleEntrySchema>;
