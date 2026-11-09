// Repeated HTML/RSC privacy regression; explicit isolated-development runs only.
import { config } from "dotenv";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getDb } from "../lib/db";

config({ path: ".env.local", quiet: true });

async function main() {
  assert.equal(process.env.NEON_BRANCH, "dev-verification");
  const origin = new URL(process.env.APP_ORIGIN!);
  assert.ok(["localhost", "127.0.0.1"].includes(origin.hostname));
  const db = getDb();
  const id = `privacy-check-${randomUUID()}`;
  try {
    await db.bouquet.create({ data: {
      id, mode: "color", flowers: [{ id: 1, count: 6 }], flowerOrder: [0, 1, 2, 3, 4, 5],
      greenery: 0, timestamp: BigInt(Date.now()), visibility: "unlisted",
      letter: { sender: "Verification", recipient: "Verification", message: `${id}-card` },
    } });
    for (let i = 0; i < 8; i++) {
      const gift = await fetch(new URL(`/bouquet/${id}`, origin));
      assert.equal(gift.status, 200);
      await gift.text();
      const garden = await fetch(new URL("/garden", origin));
      const html = await garden.text();
      assert.equal(garden.status, 200);
      assert.ok(!html.includes("The garden is resting"));
      const index = html.indexOf(id);
      assert.ok(index < 0, "Unlisted ID must not appear in garden HTML/RSC");
    }
    console.log("PASS: 8 repeated gift-to-gallery requests do not leak unlisted IDs or cards");
  } finally {
    await db.bouquet.deleteMany({ where: { id } });
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof assert.AssertionError ? error.message : "Gallery isolation check failed");
  process.exitCode = 1;
});
