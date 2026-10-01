import { z } from 'zod';

// ── model Attempt (database/src/contract.prisma) ────────────────────────
// Server owns: id, createdAt, updatedAt
// Body-only schemas — pair with the validateBody middleware.

// One reveal entry inside the `reveals` Json column — accumulating transcript:
// [{ "exchangeId": 1, "fixed": true }]
export const revealSchema = z.object({
  exchangeId: z.number().int().positive('exchangeId must be a positive integer'),
  fixed: z.boolean().default(true), // true = part of the 3 fixed reveals
});
export type Reveal = z.infer<typeof revealSchema>;

// POST /api/sessions/:sessionId/attempts (first open / resume of a movie)
export const createAttemptSchema = z.object({
  sessionId: z.number().int().positive('sessionId must be a positive integer'),
  movieId: z.number().int().positive('movieId must be a positive integer'),
  reveals: z.array(revealSchema).default([]),
  freeTapsUsed: z.number().int().nonnegative().default(0), // scoring: max(40, 100 − 15 × freeTapsUsed)
});

// PATCH /api/attempts/:id (reveal taps, guesses, finishing)
export const updateAttemptSchema = z.object({
  reveals: z.array(revealSchema).optional(),
  freeTapsUsed: z.number().int().nonnegative().optional(),
  guess: z.string().trim().min(1).nullable().optional(), // null = not guessed yet
  correct: z.boolean().optional(),
  score: z.number().int().min(0).max(100).optional(), // 0 if wrong; 40–100 if right
  finishedAt: z.iso.datetime().optional(), // set when the movie is answered → resume state
});

export type CreateAttemptInput = z.infer<typeof createAttemptSchema>;
export type UpdateAttemptInput = z.infer<typeof updateAttemptSchema>;
