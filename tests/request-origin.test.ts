import assert from "node:assert/strict";
import test from "node:test";
import { isAllowedBouquetOrigin } from "../lib/request-origin";

test("development accepts its actual origin even when APP_ORIGIN uses another local address", () => {
  assert.equal(isAllowedBouquetOrigin("http://192.168.1.5:3000", "http://192.168.1.5:3000/api/bouquets", {
    appOrigin: "http://localhost:3000", nodeEnv: "development",
  }), true);
});

test("production accepts canonical and platform-provided deployment origins", () => {
  const config = { appOrigin: "https://flowers.example.com", nodeEnv: "production", vercel: "1", vercelUrl: "flowers-preview.vercel.app", vercelProductionUrl: "flowers.vercel.app" };
  for (const origin of [config.appOrigin, "https://flowers-preview.vercel.app", "https://flowers.vercel.app"]) {
    assert.equal(isAllowedBouquetOrigin(origin, "http://localhost:3000/api/bouquets", config), true);
  }
  assert.equal(isAllowedBouquetOrigin("https://attacker.example.com", "https://attacker.example.com/api/bouquets", config), false);
});

test("missing, malformed, null, and cross-site origins are rejected without throwing", () => {
  for (const origin of [null, "null", "https://flowers.example.com.evil.test", "https://flowers.example.com/path", "https://user:pass@flowers.example.com"]) {
    assert.equal(isAllowedBouquetOrigin(origin, "https://flowers.example.com/api/bouquets", { appOrigin: "https://flowers.example.com", nodeEnv: "production" }), false);
  }
  assert.equal(isAllowedBouquetOrigin("https://flowers.example.com", "https://flowers.example.com/api/bouquets", { appOrigin: "not-a-url", nodeEnv: "production" }), false);
});

test("deployment variables are ignored outside Vercel", () => {
  assert.equal(isAllowedBouquetOrigin("https://flowers-preview.vercel.app", "https://flowers-preview.vercel.app/api/bouquets", { nodeEnv: "production", vercelUrl: "flowers-preview.vercel.app" }), false);
});
