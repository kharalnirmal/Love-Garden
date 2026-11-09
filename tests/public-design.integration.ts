// Explicit development-only verification. Never part of pnpm test.
import { config } from "dotenv";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getDb } from "../lib/db";
import { createBouquet, getBouquetById, getPublicDesignById, listPublicBouquets } from "../lib/bouquet-repository";

config({ path: ".env.local", quiet: true });

async function main() {
  assert.equal(process.env.NEON_BRANCH, "dev-verification");
  const ids: string[] = [];
  const marker = `private-${randomUUID()}`;
  const payload = {
    mode: "color", flowers: [{ id: 1, count: 6 }], flowerOrder: [0, 1, 2, 3, 4, 5],
    greenery: 0, timestamp: Date.now(),
    letter: { sender: marker, recipient: marker, message: marker },
    presentation: { ribbon: "sage", wrapping: "blush", tag: marker.slice(0, 35), card: "classic" },
  };
  const db = getDb();
  try {
    for (const visibility of ["unlisted", "public"] as const) {
      const id = await createBouquet({ ...payload, visibility });
      ids.push(id);
      const row = await db.bouquet.findUniqueOrThrow({ where: { id }, select: { gardenId: true } });
      assert.equal(await getPublicDesignById(id), null, "Private IDs cannot open garden designs");
      if (visibility === "unlisted") {
        assert.equal(row.gardenId, null);
        continue;
      }
      assert.ok(row.gardenId && row.gardenId !== id);
      const design = await getPublicDesignById(row.gardenId);
      assert.ok(design);
      assert.equal(JSON.stringify(design).includes(marker), false);
      assert.equal(JSON.stringify(design).includes(id), false);
      assert.equal(await getBouquetById(row.gardenId), null, "Public design IDs cannot open recipient gifts");
      const garden = await listPublicBouquets();
      assert.equal(JSON.stringify(garden).includes(marker), false);
      assert.equal(JSON.stringify(garden).includes(id), false);
      const gift = await getBouquetById(id);
      assert.equal(gift?.letter.message, marker, "Recipient note is preserved");
    }
    console.log("PASS: public garden uses separate IDs, strips personal text, and preserves private recipient notes");
  } finally {
    await db.bouquet.deleteMany({ where: { id: { in: ids } } });
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof assert.AssertionError ? error.message : `Public-design integration failed: ${error instanceof Error ? error.name : "unknown"}`);
  if (error instanceof Error) console.error(error.stack?.split("\n").filter((line) => line.includes("tests/public-design") || line.includes("lib/public-bouquet") || line.includes("lib/bouquet-repository")).join("\n"));
  process.exitCode = 1;
});
