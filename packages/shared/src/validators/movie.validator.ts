import { z } from 'zod';
import { movieStatusEnum } from './enums.validator';

// ── model Movie (database/src/contract.prisma) ──────────────────────────
// Server owns: id, createdAt, updatedAt
// Body-only schemas — pair with the validateBody middleware.

// POST /api/movies
export const createMovieSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  year: z.number().int().min(1888).max(2100),
  runtime: z.number().int().positive('Runtime must be a positive number of minutes'),
  genre: z.string().trim().min(1).optional(),
  tier: z.number().int().min(1).max(3).default(2), // difficulty 1–3 (easy → deep cut)
  status: movieStatusEnum.default('DRAFT'),
});

// PATCH /api/movies/:id
export const updateMovieSchema = z.object({
  title: z.string().trim().min(1).optional(),
  year: z.number().int().min(1888).max(2100).optional(),
  runtime: z.number().int().positive().optional(),
  genre: z.string().trim().min(1).optional(),
  tier: z.number().int().min(1).max(3).optional(),
  status: movieStatusEnum.optional(),
});

export type CreateMovieInput = z.infer<typeof createMovieSchema>;
export type UpdateMovieInput = z.infer<typeof updateMovieSchema>;
