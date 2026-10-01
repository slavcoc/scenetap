import { z } from 'zod';

// ── model MovieOptions (database/src/contract.prisma) ───────────────────
// movieId is the primary key — there are no server-owned fields.
// Body-only schemas — pair with the validateBody middleware.

// POST /api/movies/:movieId/options
export const createMovieOptionsSchema = z.object({
  movieId: z.number().int().positive('movieId must be a positive integer'),
  distractors: z
    .array(z.string().trim().min(1))
    .length(3, 'Exactly 3 distractors are required'), // 3 wrong titles; correct title is Movie.title
});

// PUT /api/movies/:movieId/options (upsert — movieId is the PK)
export const upsertMovieOptionsSchema = z.object({
  movieId: z.number().int().positive(),
  distractors: z.array(z.string().trim().min(1)).length(3, 'Exactly 3 distractors are required'),
});

export type CreateMovieOptionsInput = z.infer<typeof createMovieOptionsSchema>;
export type UpsertMovieOptionsInput = z.infer<typeof upsertMovieOptionsSchema>;
