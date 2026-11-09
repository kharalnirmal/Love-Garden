import "server-only";
import { withDb } from "@/lib/db";
import { createBouquetSchema, shareIdSchema } from "@/lib/bouquet-validation";
import type { SavedBouquet } from "@/types/bouquet";
import { toPublicDesign } from "@/lib/public-bouquet";
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
  await withDb((db) => db.bouquet.create({
    data: { ...payload, id, gardenId: payload.visibility === "public" ? nanoid(24) : null, timestamp: BigInt(payload.timestamp) },
    select: { id: true },
  }));
  return id;
}

export async function getBouquetById(id: string): Promise<SavedBouquet | null> {
  if (!shareIdSchema.safeParse(id).success) return null;
  const row = await withDb((db) => db.bouquet.findUnique({ where: { id } }));
  return row ? toBouquet(row) : null;
}

// Link previews and QR checks must not load card text, names, or personal tags.
export async function getBouquetPreviewById(id: string) {
  if (!shareIdSchema.safeParse(id).success) return null;
  const row = await withDb((db) => db.bouquet.findUnique({
    where: { id },
    select: { mode: true, flowers: true },
  }));
  if (!row) return null;
  return { mode: row.mode, flowers: createBouquetSchema.shape.flowers.parse(row.flowers) };
}

export async function listPublicBouquets(before?: string) {
  if (before && !shareIdSchema.safeParse(before).success) throw new Error("Invalid garden cursor");
  const rows = await withDb((db) => db.bouquet.findMany({
    where: { visibility: "public", gardenId: { not: null } },
    ...(before ? { cursor: { gardenId: before }, skip: 1 } : {}),
    orderBy: [{ createdAt: "desc" }, { gardenId: "desc" }],
    take: 13,
    // Never fetch names or private messages into the gallery.
    select: publicDesignSelect,
  }));
  const hasMore = rows.length > 12;
  const page = rows.slice(0, 12);
  const bouquets = page.map(toPublicDesign);
  return { bouquets, nextCursor: hasMore ? page[page.length - 1].gardenId : null };
}

// No gift ID, names, or note are fetched by garden queries.
const publicDesignSelect = {
  gardenId: true, mode: true, flowers: true, flowerOrder: true,
  greenery: true, timestamp: true, createdAt: true, presentation: true,
} as const;

export async function getPublicDesignById(id: string) {
  if (!shareIdSchema.safeParse(id).success) return null;
  const row = await withDb((db) => db.bouquet.findFirst({
    where: { gardenId: id, visibility: "public" },
    select: publicDesignSelect,
  }));
  return row ? toPublicDesign(row) : null;
}
