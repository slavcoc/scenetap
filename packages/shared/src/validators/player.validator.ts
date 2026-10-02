import { z } from 'zod';
import { authProviderEnum } from './enums.validator';

// ── model Player (database/src/contract.prisma) ─────────────────────────
// Server owns: id, createdAt, lastSeenAt
// Body-only schemas — pair with the validateBody middleware.

// POST /api/players (guest registration / sign-in)
// provider EMAIL requires a password; guest/social sign-ins omit it.
export const createPlayerSchema = z
  .object({
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128).optional(),
    provider: authProviderEnum.default('GUEST'),
    timezone: z.string().trim().min(1).default('UTC'),
  })
  .superRefine((data, ctx) => {
    if (data.provider === 'EMAIL' && !data.password) {
      ctx.addIssue({ code: 'custom', message: 'Password is required for EMAIL provider', path: ['password'] });
    }
  });

// PATCH /api/players/:id
export const updatePlayerSchema = z.object({
  email: z.email('Invalid email address'),
  provider: authProviderEnum.optional(),
  timezone: z.string().trim().min(1).optional(),
});

// POST /users/signup/email — provider is fixed to EMAIL server-side
export const signupWithPasswordSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128),
  timezone: z.string().trim().min(1).default('UTC'),
});

// POST /users/login/password
export const loginWithPasswordSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(128),
});

// POST /users/login/google
export const loginWithGoogleSchema = z.object({
  idToken: z.string().min(1, 'Google ID token is required'),
});

export type CreatePlayerInput = z.infer<typeof createPlayerSchema>;
export type UpdatePlayerInput = z.infer<typeof updatePlayerSchema>;
export type SignupWithPasswordInput = z.infer<typeof signupWithPasswordSchema>;
export type LoginWithPasswordInput = z.infer<typeof loginWithPasswordSchema>;
export type LoginWithGoogleInput = z.infer<typeof loginWithGoogleSchema>;
