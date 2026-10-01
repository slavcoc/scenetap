import { z } from 'zod';

// Enums mirrored from database/src/contract.prisma

export const movieStatusEnum = z.enum(['DRAFT', 'APPROVED']);
export type MovieStatus = z.infer<typeof movieStatusEnum>;

export const exchangeTierEnum = z.enum(['ICONIC', 'MEDIUM', 'DEEPCUT']);
export type ExchangeTier = z.infer<typeof exchangeTierEnum>;

export const authProviderEnum = z.enum(['GUEST', 'GOOGLE', 'EMAIL']);
export type AuthProvider = z.infer<typeof authProviderEnum>;

export const sessionStatusEnum = z.enum(['IN_PROGRESS', 'FINISHED']);
export type SessionStatus = z.infer<typeof sessionStatusEnum>;

export const eventTypeEnum = z.enum([
  'TAP',
  'GUESS',
  'SHARE',
  'ROUND_COMPLETE',
  'SESSION_COMPLETE',
]);
export type EventType = z.infer<typeof eventTypeEnum>;
