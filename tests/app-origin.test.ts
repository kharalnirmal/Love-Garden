import assert from "node:assert/strict";
import test from "node:test";
import { getAppOrigin, publicAppOrigin } from "../lib/app-origin";
import { giftUrl } from "../lib/gift-sharing";

test("production gift links never retain a localhost configuration", () => {
  for (const appOrigin of [undefined, "http://localhost:3000", "http://127.0.0.1:3100", "http://[::1]:3000"]) {
    const origin = getAppOrigin({ appOrigin, nodeEnv: "production" });
    assert.equal(origin, publicAppOrigin);
    assert.equal(giftUrl("example-gift", origin), "https://lovebouquet.vercel.app/gift/example-gift");
  }
});

test("explicit custom HTTPS origins are respected", () => {
  assert.equal(getAppOrigin({ appOrigin: "https://flowers.example.com/", nodeEnv: "production" }), "https://flowers.example.com");
});

test("development retains local links and invalid origins are rejected", () => {
  assert.equal(getAppOrigin({ appOrigin: "http://localhost:3000", nodeEnv: "development" }), "http://localhost:3000");
  assert.throws(() => getAppOrigin({ appOrigin: "https://flowers.example.com/unsafe", nodeEnv: "production" }));
});
