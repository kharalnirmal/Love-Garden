import { z } from "zod";
import { flowers } from "@/data/data";

export const shareIdSchema = z.string().regex(/^[A-Za-z0-9_-]{1,128}$/);
export const presentationSchema = z.object({
  ribbon: z.enum(["rose", "sage", "ivory"]).default("rose"),
  wrapping: z.enum(["none", "cream", "blush"]).default("none"),
  tag: z.string().trim().max(40).default(""),
  card: z.enum(["classic", "blush", "botanical"]).default("classic"),
});

export const createBouquetSchema = z.object({
  mode: z.enum(["color", "mono"]),
  flowers: z.array(z.object({
    id: z.number().int().refine((id) => flowers.some((f) => f.id === id), "Unknown flower"),
    count: z.number().int().min(1).max(10),
  })).min(1).max(10),
  letter: z.object({
    sender: z.string().trim().max(80),
    recipient: z.string().trim().max(80),
    message: z.string().trim().max(2000),
  }),
  timestamp: z.number().int().min(0).max(8640000000000000),
  greenery: z.number().int().min(0).max(2),
  flowerOrder: z.array(z.number().int().min(0).max(9)).max(10),
  visibility: z.enum(["unlisted", "public"]).default("unlisted"),
  presentation: presentationSchema.optional(),
}).superRefine((bouquet, ctx) => {
  const total = bouquet.flowers.reduce((sum, f) => sum + f.count, 0);
  if (total < 6 || total > 10) {
    ctx.addIssue({ code: "custom", path: ["flowers"], message: "Choose 6 to 10 flowers." });
  }
  if (new Set(bouquet.flowers.map((f) => f.id)).size !== bouquet.flowers.length) {
    ctx.addIssue({ code: "custom", path: ["flowers"], message: "Combine duplicate flower selections." });
  }
  if (bouquet.flowerOrder.length !== total ||
      new Set(bouquet.flowerOrder).size !== total ||
      bouquet.flowerOrder.some((i) => i >= total)) {
    ctx.addIssue({ code: "custom", path: ["flowerOrder"], message: "Invalid flower arrangement." });
  }
});

export type CreateBouquetInput = z.infer<typeof createBouquetSchema>;
