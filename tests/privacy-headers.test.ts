import assert from "node:assert/strict";
import test from "node:test";

test("all pages suppress referrers and framing; gift routes prohibit indexing and caching", async () => {
  // Config is JavaScript so the same values are checked that Next.js deploys.
  const { default: config } = await import("../next.config.mjs");
  assert.ok(config.headers);
  const rules = await config.headers();
  const global = rules.find((rule: { source: string }) => rule.source === "/:path*");
  assert.ok(global);
  const headers = Object.fromEntries(global.headers.map((header: { key: string; value: string }) => [header.key, header.value]));
  assert.equal(headers["Referrer-Policy"], "no-referrer");
  assert.equal(headers["X-Frame-Options"], "DENY");
  assert.match(headers["Content-Security-Policy"], /frame-ancestors 'none'/);
  for (const source of ["/gift/:path*", "/bouquet/:path*"]) {
    const rule = rules.find((rule: { source: string }) => rule.source === source);
    assert.ok(rule);
    const privateHeaders = Object.fromEntries(rule.headers.map((header: { key: string; value: string }) => [header.key, header.value]));
    assert.match(privateHeaders["X-Robots-Tag"], /noindex/);
    assert.match(privateHeaders["Cache-Control"], /private, no-store/);
  }
});
