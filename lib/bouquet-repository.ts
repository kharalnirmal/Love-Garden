import "server-only";
import { getDb } from "@/lib/db";
import { createBouquetSchema, shareIdSchema } from "@/lib/bouquet-validation";
import type { Bouquet, SavedBouquet } from "@/types/bouquet";
import type { Bouquet as BouquetRecord } from "@/generated/prisma/client";
import { nanoid } from "nanoid";

function toBouquet(row: BouquetRecord): SavedBouquet {
  const payload = createBouquetSchema.parse({
    ...row,
    timestamp: Number(row.timestamp),
    presentation: row.presentation ?? undefined,
  });
  return { ...payload, id: row.id, created_at: row.createdAt.toISOString() };
}

export async function createBouquet(input: unknown): Promise<string> {
  const payload = createBouquetSchema.parse(input);
  const id = nanoid(24);
  await getDb().bouquet.create({
    data: { ...payload, id, timestamp: BigInt(payload.timestamp) },
    select: { id: true },
  });
  return id;
}

export async function getBouquetById(id: string): Promise<SavedBouquet | null> {
  if (!shareIdSchema.safeParse(id).success) return null;
  const row = await getDb().bouquet.findUnique({ where: { id } });
  return row ? toBouquet(row) : null;
}

export async function listPublicBouquets(before?: string) {
  if (before && !shareIdSchema.safeParse(before).success) throw new Error("Invalid garden cursor");
  const rows = await getDb().bouquet.findMany({
    where: { visibility: "public" },
    ...(before ? { cursor: { id: before }, skip: 1 } : {}),
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 13,
    // Never fetch names or private messages into the gallery.
    select: { id: true, mode: true, flowers: true, flowerOrder: true,
      greenery: true, timestamp: true, createdAt: true },
  });
  const hasMore = rows.length > 12;
  const page = rows.slice(0, 12);
  const bouquets: (Bouquet & { id: string; created_at: string })[] = page.map((row) => ({
    ...row,
    flowers: createBouquetSchema.shape.flowers.parse(row.flowers),
    flowerOrder: createBouquetSchema.shape.flowerOrder.parse(row.flowerOrder),
    timestamp: Number(row.timestamp),
    letter: { sender: "", recipient: "", message: "" },
    created_at: row.createdAt.toISOString(),
  }));
  return { bouquets, nextCursor: hasMore ? page[page.length - 1].id : null };
}
