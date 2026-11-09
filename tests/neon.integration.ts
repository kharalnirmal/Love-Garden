// Explicit opt-in only: pnpm exec tsx --conditions=react-server tests/neon.integration.ts
// Requires a fresh dev server using the same .env.local. Never runs with pnpm test.
import { config } from "dotenv";
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { getDb } from "../lib/db";
import { getBouquetById, listPublicBouquets } from "../lib/bouquet-repository";
import { consumeWriteLimit } from "../lib/write-rate-limit";

config({ path: ".env.local", quiet: true });

async function main() {
  assert.equal(process.env.NEON_BRANCH, "dev-verification", "Only the isolated verification branch is allowed");
  const origin = new URL(process.env.APP_ORIGIN!);
  assert.ok(["localhost", "127.0.0.1"].includes(origin.hostname), "Only a local test server is allowed");
  const db = getDb();
  const marker = `verification-${randomUUID()}`;
  const ids: string[] = [];
  const secret = process.env.RATE_LIMIT_SECRET;
  const limiterSecret = randomUUID() + randomUUID();
  const limiterKeys = new Set<string>();
  const payload = {
    mode: "color", flowers: [{ id: 1, count: 2 }, { id: 12, count: 4 }],
    flowerOrder: [5, 1, 2, 3, 4, 0], greenery: 2, timestamp: Date.now(),
    letter: { sender: marker, recipient: "Test recipient", message: `${marker}-private-card` },
  };
  async function post(body: unknown, requestOrigin = origin.origin) {
    return fetch(new URL("/api/bouquets", origin), {
      method: "POST", headers: { Origin: requestOrigin, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  }
  try {
    for (const mode of ["color", "mono"] as const) {
      const response = await post({ ...payload, mode, ...(mode === "mono" ? { visibility: "public" } : {}) });
      assert.equal(response.status, 201, "Save failed (or local hourly write limit already used)");
      const result = await response.json() as { id: string };
      ids.push(result.id);
      assert.match(result.id, /^[A-Za-z0-9_-]{24}$/);
      const saved = await getBouquetById(result.id);
      assert.ok(saved);
      assert.equal(saved.mode, mode);
      assert.deepEqual(saved.flowers, payload.flowers);
      assert.deepEqual(saved.flowerOrder, payload.flowerOrder);
      assert.deepEqual(saved.letter, payload.letter);
      assert.equal(saved.greenery, 2);
      assert.equal(saved.visibility, mode === "mono" ? "public" : "unlisted");
      const page = await fetch(new URL(`/bouquet/${result.id}`, origin));
      assert.equal(page.status, 200);
      assert.ok((await page.text()).includes(marker), "Saved card should render on its gift page");
    }
    console.log("PASS: API saves and Neon retrieval preserve both modes, quantities, order, greenery, and card");

    assert.equal((await post({ ...payload, flowerOrder: [0] })).status, 422);
    assert.equal((await post({ ...payload, letter: { ...payload.letter, message: "x".repeat(2001) } })).status, 422);
    assert.equal((await post(payload, "https://invalid.example")).status, 403);
    const oversized = await post({ padding: "x".repeat(17000) });
    assert.equal(oversized.status, 413);
    assert.equal((await fetch(new URL(`/bouquet/${marker}`, origin))).status, 404);
    console.log("PASS: invalid arrangement, long message, oversized body, foreign origin, and missing gift");

    const fixtureIds = Array.from({ length: 14 }, (_, i) => `${marker}-${String(i).padStart(2, "0")}`);
    ids.push(...fixtureIds);
    await db.bouquet.createMany({ data: fixtureIds.map((id) => ({
      ...payload, id, timestamp: BigInt(payload.timestamp), visibility: "public" as const,
      // Equal timestamps explicitly exercise the secondary ID ordering.
      createdAt: new Date("2099-01-01T00:00:00Z"),
    })) });
    const first = await listPublicBouquets();
    assert.equal(first.bouquets.length, 12);
    assert.ok(first.nextCursor);
    const second = await listPublicBouquets(first.nextCursor);
    const combined = [...first.bouquets, ...second.bouquets];
    const combinedIds = combined.map((b) => b.id);
    assert.equal(new Set(combinedIds).size, combinedIds.length, "Pagination must not repeat rows");
    for (const id of fixtureIds) assert.ok(combinedIds.includes(id), "Pagination must not skip equal-date rows");
    assert.ok(!combinedIds.includes(ids[0]), "Unlisted gift must not appear in public queries");
    for (const bouquet of combined) assert.deepEqual(bouquet.letter, { sender: "", recipient: "", message: "" });
    const garden = await fetch(new URL("/garden", origin));
    const html = await garden.text();
    assert.equal(garden.status, 200);
    assert.ok(!html.includes("The garden is resting"));
    const privateIdIndex = html.indexOf(ids[0]);
    assert.ok(privateIdIndex < 0, "Unlisted link must not leak in gallery HTML/RSC");
    // Public IDs contain the marker; card text uses a distinct suffix.
    assert.ok(!html.includes(`${marker}-private-card`), "Card message must not leak into previews");
    assert.ok(!html.includes("Test recipient"), "Card recipient must not leak into previews");
    assert.ok(html.includes("More bouquets"));
    console.log("PASS: public-only pagination, equal timestamps, private card projection, gallery HTML");

    // Isolate limiter checks from the dev server's normal shared bucket.
    process.env.RATE_LIMIT_SECRET = limiterSecret;
    const identity = process.env.VERCEL === "1" ? "shared" : "local-shared";
    const rememberKey = () => limiterKeys.add(createHmac("sha256", limiterSecret)
      .update(`${identity}:${Math.floor(Date.now() / 3600000)}`).digest("hex"));
    rememberKey();
    const limits = await Promise.all(Array.from({ length: 10 }, () => consumeWriteLimit(new Headers())));
    rememberKey();
    assert.equal(limits.filter((r) => r.allowed).length, 5);
    assert.ok(limits.every((r) => r.retryAfter > 0 && r.retryAfter <= 3600));
    console.log("PASS: atomic limiter permits exactly 5 of 10 simultaneous attempts");
  } finally {
    if (secret === undefined) delete process.env.RATE_LIMIT_SECRET;
    else process.env.RATE_LIMIT_SECRET = secret;
    // Only IDs allocated by this run; never reset tables or remove existing gifts.
    await db.bouquet.deleteMany({ where: { id: { in: ids } } });
    await db.writeRateLimit.deleteMany({ where: { key: { in: [...limiterKeys] } } });
    await db.$disconnect();
    console.log("Cleaned this run's test bouquets and isolated limiter buckets");
  }
}

main().catch((error: unknown) => {
  // Avoid accidentally printing connection strings or private records in driver errors.
  if (error instanceof assert.AssertionError) console.error(error.message);
  else console.error(`Failure type: ${error instanceof Error ? error.name : "unknown"}`);
  console.error("Neon integration verification failed. Check the last PASS and local server logs.");
  process.exitCode = 1;
});
