import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

config({ path: ".env.local", quiet: true });
config({ path: ".env", quiet: true });

// Run against a local production server, never a public deployment.
const origin = process.argv[2] || "http://127.0.0.1:3100";
assert.ok(["127.0.0.1", "localhost"].includes(new URL(origin).hostname));
assert.equal(process.env.NEON_BRANCH, "dev-verification", "Use the isolated verification branch, never production");
assert.ok(process.env.DATABASE_URL && process.env.RATE_LIMIT_SECRET);
const sql = neon(process.env.DATABASE_URL);
const marker = `NeonSmoke_${randomUUID()}`;
const ids = [];
const key = createHmac("sha256", process.env.RATE_LIMIT_SECRET)
  .update(`local-shared:${Math.floor(Date.now() / 3600000)}`).digest("hex");
const existingLimit = await sql`SELECT "count" FROM write_rate_limits WHERE "key" = ${key}`;

async function save(visibility) {
  const response = await fetch(`${origin}/api/bouquets`, {
    method: "POST",
    headers: { origin, "content-type": "application/json" },
    body: JSON.stringify({
      mode: "color", flowers: [{ id: 1, count: 6 }],
      flowerOrder: [0, 1, 2, 3, 4, 5], greenery: 1,
      timestamp: Date.now(), visibility,
      letter: { sender: marker, recipient: "Integration test", message: `${marker}_${visibility}` },
    }),
  });
  const body = await response.json();
  if (response.status === 201) ids.push(body.id);
  assert.equal(response.status, 201, JSON.stringify(body));
  return body;
}

try {
  const privateGift = await save("unlisted");
  const publicGift = await save("public");
  console.log("PASS POST /api/bouquets: unlisted and public saves returned 201");
  for (const gift of [privateGift, publicGift]) {
    const rows = await sql`SELECT id, letter FROM bouquets WHERE id = ${gift.id}`;
    assert.equal(rows.length, 1);
    assert.equal(rows[0].letter.sender, marker);
    const response = await fetch(`${origin}${gift.path}`);
    assert.equal(response.status, 200);
    assert.ok((await response.text()).includes(marker));
  }
  console.log("PASS Neon persistence + GET /bouquet/[id]: saved messages round-trip through the app");
  const garden = await fetch(`${origin}/garden`);
  assert.equal(garden.status, 200);
  const html = await garden.text();
  const [publicDesign] = await sql`SELECT garden_id FROM bouquets WHERE id = ${publicGift.id}`;
  assert.ok(publicDesign.garden_id && html.includes(publicDesign.garden_id));
  assert.ok(!html.includes(publicGift.id));
  assert.ok(!html.includes(privateGift.id));
  assert.ok(!html.includes(marker));
  const designPage = await fetch(`${origin}/garden/${publicDesign.garden_id}`);
  assert.equal(designPage.status, 200);
  const designHtml = await designPage.text();
  assert.ok(!designHtml.includes(marker));
  assert.ok(!designHtml.includes(publicGift.id));
  console.log("PASS GET /garden: design-only sharing uses independent IDs and excludes personal messages");
  if (existingLimit.length === 0) {
    for (let i = 0; i < 3; i++) await save("unlisted");
    const response = await fetch(`${origin}/api/bouquets`, {
      method: "POST", headers: { origin, "content-type": "application/json" },
      body: JSON.stringify({ mode: "color", flowers: [{ id: 1, count: 6 }],
        flowerOrder: [0, 1, 2, 3, 4, 5], greenery: 1, timestamp: Date.now(),
        letter: { sender: marker, recipient: "Test", message: "Rate limit test" } }),
    });
    assert.equal(response.status, 429);
    assert.ok(Number(response.headers.get("retry-after")) > 0);
    console.log("PASS Postgres rate limiter: sixth save returned 429 with Retry-After");
  } else {
    console.log("SKIP limiter saturation: an existing bucket must not be reset");
  }
} finally {
  for (const id of ids) {
    await sql`DELETE FROM bouquets WHERE id = ${id} AND letter->>'sender' = ${marker}`;
  }
  if (existingLimit.length === 0) {
    await sql`DELETE FROM write_rate_limits WHERE "key" = ${key} AND "count" = ${ids.length}`;
  }
  console.log(`Cleaned up ${ids.length} test bouquets; unrelated records were not modified.`);
}
