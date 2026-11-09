import "server-only";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createDb(): PrismaClient {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_NOT_CONFIGURED");
  return new PrismaClient({
    adapter: new PrismaNeon({
      connectionString: process.env.DATABASE_URL,
      max: 3,
      connectionTimeoutMillis: 10000,
    }),
  });
}

export function getDb(): PrismaClient {
  globalForPrisma.prisma ??= createDb();
  return globalForPrisma.prisma;
}

export async function withDb<T>(operation: (db: PrismaClient) => Promise<T>): Promise<T> {
  // React's development RSC tracing annotates awaited promises with their owner.
  // Prisma caches initialization promises: sharing a dev client across requests
  // can serialize a previous gift page's params into another page's debug trace.
  // Scope dev clients to one operation; production keeps the shared pool.
  const isolated = process.env.NODE_ENV === "development";
  const db = isolated ? createDb() : getDb();
  try {
    return await operation(db);
  } finally {
    if (isolated) await db.$disconnect();
  }
}
