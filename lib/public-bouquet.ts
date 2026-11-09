import { createBouquetSchema, presentationSchema } from "@/lib/bouquet-validation";
import type { Bouquet } from "@/types/bouquet";

export type PublicDesignRow = {
  gardenId: string | null;
  mode: string;
  flowers: unknown;
  flowerOrder: unknown;
  greenery: number;
  timestamp: bigint;
  createdAt: Date;
  presentation: unknown;
};

export function toPublicDesign(row: PublicDesignRow): Bouquet & { id: string; created_at: string } {
  if (!row.gardenId) throw new Error("PUBLIC_DESIGN_NOT_CONFIGURED");
  const finish = presentationSchema.parse(row.presentation ?? {});
  // Construct explicitly: never spread a private gift record into public output.
  return {
    id: row.gardenId,
    mode: row.mode,
    flowers: createBouquetSchema.shape.flowers.parse(row.flowers),
    flowerOrder: createBouquetSchema.shape.flowerOrder.parse(row.flowerOrder),
    greenery: row.greenery,
    timestamp: Number(row.timestamp),
    created_at: row.createdAt.toISOString(),
    letter: { sender: "", recipient: "", message: "" },
    presentation: { ribbon: finish.ribbon, wrapping: finish.wrapping, tag: "", card: "classic" },
  };
}
