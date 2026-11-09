import assert from "node:assert/strict";
import test from "node:test";
import { giftDescription, giftMetadata, giftTitle } from "../lib/site-metadata";

test("gift previews use canonical image URLs and generic, private-safe copy", () => {
  const previous = process.env.APP_ORIGIN;
  process.env.APP_ORIGIN = "https://flowers.example.com";
  try {
    const metadata = giftMetadata("a-gift-for-someone-special");
    assert.equal(metadata.title, giftTitle);
    assert.equal(metadata.description, giftDescription);
    assert.deepEqual(metadata.robots, { index: false, follow: false });
    assert.deepEqual(metadata.alternates, { canonical: "https://flowers.example.com/gift/a-gift-for-someone-special" });
    assert.equal((metadata.twitter as { card: string }).card, "summary_large_image");
    const images = metadata.openGraph?.images as { url: string }[];
    assert.equal(images[0].url, "https://flowers.example.com/gift/a-gift-for-someone-special/opengraph-image");
    assert.deepEqual(metadata.twitter?.images, images);
  } finally {
    if (previous === undefined) delete process.env.APP_ORIGIN;
    else process.env.APP_ORIGIN = previous;
  }
});

test("invalid gift IDs do not become canonical or preview URLs", () => {
  const metadata = giftMetadata("../private");
  assert.equal(metadata.alternates, undefined);
  assert.equal(metadata.openGraph?.images, undefined);
});
