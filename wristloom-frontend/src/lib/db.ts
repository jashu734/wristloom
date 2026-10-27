// ============================================================
// Wristloom Backend — Prisma Client Singleton (Prisma v7)
// ============================================================
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

function createPrismaClient() {
  let connectionString =
    process.env.DATABASE_URL ||
    process.env.DIRECT_URL ||
    'postgresql://postgres:postgres@localhost:5432/postgres';

  if (!connectionString.includes('schema=')) {
    connectionString += connectionString.includes('?') ? '&schema=public' : '?schema=public';
  }

  const adapter = new PrismaPg({ connectionString }, { schema: 'public' });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = db;
