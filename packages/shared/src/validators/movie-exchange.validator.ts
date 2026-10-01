import { z } from 'zod';
import { exchangeTierEnum } from './enums.validator';

// ── model MovieExchange (database/src/contract.prisma) ──────────────────
// Server owns: id
// Body-only schemas — pair with the validateBody middleware.

// One dialogue line inside the `lines` Json column:
// [{ "speaker": "Hans", "text": "..." }]
export const exchangeLineSchema = z.object({
  speaker: z.string().trim().min(1, 'Speaker is required'),
  text: z.string().trim().min(1, 'Line text is required'),
});
export type ExchangeLine = z.infer<typeof exchangeLineSchema>;

// POST /api/movies/:movieId/exchanges
export const createMovieExchangeSchema = z.object({
  movieId: z.number().int().positive('movieId must be a positive integer'),
  minute: z.number().int().nonnegative('Minute must be a non-negative integer'),
  lines: z.array(exchangeLineSchema).min(1, 'At least one line is required'),
  tier: exchangeTierEnum,
  isFixed: z.boolean().default(false), // part of the 3 fixed reveals?
  poolRank: z.number().int().positive().optional(), // 1 = most recognizable free-tap rank
});

// PATCH /api/exchanges/:id
export const updateMovieExchangeSchema = z.object({
  minute: z.number().int().nonnegative().optional(),
  lines: z.array(exchangeLineSchema).min(1).optional(),
  tier: exchangeTierEnum.optional(),
  isFixed: z.boolean().optional(),
  poolRank: z.number().int().positive().optional(),
});

export type CreateMovieExchangeInput = z.infer<typeof createMovieExchangeSchema>;
export type UpdateMovieExchangeInput = z.infer<typeof updateMovieExchangeSchema>;
