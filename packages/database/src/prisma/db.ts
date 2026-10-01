import 'dotenv/config';
import postgres from '@prisma/orm-postgres/runtime';
import type { Contract } from './contract.d';
import contractJson from './contract.json'
import PrismaClientKnownRequestError from "@prisma/orm-postgres/runtime"

export const db = postgres<Contract>({
  contractJson,
  url: process.env['DATABASE_URL']!,
});

export {PrismaClientKnownRequestError}