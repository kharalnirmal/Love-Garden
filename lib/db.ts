import "server-only";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export function getDb(): PrismaClient {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_NOT_CONFIGURED");
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaNeon({
        connectionString: process.env.DATABASE_URL,
        max: 3,
        connectionTimeoutMillis: 10000,
      }),
    });
  }
  return globalForPrisma.prisma;
}
