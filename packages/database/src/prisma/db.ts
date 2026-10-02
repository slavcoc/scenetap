import 'dotenv/config';
import { config } from 'dotenv';
// Load packages/database/.env regardless of the process cwd (e.g. when the
// backend runs from apps/backend). cwd .env still wins if both define a var.
config({ path: new URL('../../.env', import.meta.url), override: false });
// Node 22 has no global Temporal, which the timestamptz codecs require.
import { Temporal } from '@js-temporal/polyfill';
(globalThis as { Temporal?: unknown }).Temporal = Temporal;
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json'
import PrismaClientKnownRequestError from "@prisma/orm-postgres/runtime"

export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
});

export { Temporal, PrismaClientKnownRequestError }