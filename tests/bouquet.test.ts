import { test } from "node:test";
import assert from "node:assert/strict";
import { createBouquetSchema, shareIdSchema } from "../lib/bouquet-validation";
import { calculateTotalFlowers, generateDefaultFlowerOrder, getFlowerInstanceIndex,
  getFlowerRotation, validateFlowerCount } from "../lib/bouquet-utils";

const valid = {
  mode: "color", flowers: [{ id: 1, count: 2 }, { id: 12, count: 4 }],
  flowerOrder: [5, 1, 2, 3, 4, 0], greenery: 2, timestamp: 1700000000000,
  letter: { sender: "Me", recipient: "You", message: "A little love ♡" },
};

test("both original modes round-trip without changing the arrangement", () => {
  for (const mode of ["color", "mono"]) {
    const result = createBouquetSchema.parse({ ...valid, mode });
    assert.equal(result.mode, mode);
    assert.deepEqual(result.flowers, valid.flowers);
    assert.deepEqual(result.flowerOrder, valid.flowerOrder);
    assert.equal(result.visibility, "unlisted");
  }
});

test("public visibility requires an explicit opt-in", () => {
  assert.equal(createBouquetSchema.parse({ ...valid, visibility: "public" }).visibility, "public");
  assert.equal(createBouquetSchema.parse(valid).visibility, "unlisted");
});

test("card styles round-trip and older gifts accept missing presentation", () => {
  assert.equal(createBouquetSchema.parse(valid).presentation, undefined);
  assert.equal(createBouquetSchema.parse(valid).presentation?.card ?? "classic", "classic");
  for (const card of ["classic", "blush", "botanical"]) {
    const presentation = { ribbon: "sage", wrapping: "cream", tag: "For you", card };
    const saved = createBouquetSchema.parse({ ...valid, presentation });
    assert.deepEqual(saved.presentation, presentation);
    assert.deepEqual(saved.flowerOrder, valid.flowerOrder);
    assert.deepEqual(saved.letter, valid.letter);
  }
  assert.equal(createBouquetSchema.safeParse({ ...valid, presentation: { card: "invalid" } }).success, false);
});

test("ribbons, wrapping, and gift tags survive validation without changing the card", () => {
  for (const ribbon of ["rose", "sage", "ivory"]) {
    for (const wrapping of ["none", "cream", "blush"]) {
      const presentation = { ribbon, wrapping, tag: "For you ♡", card: "blush" };
      assert.deepEqual(createBouquetSchema.parse({ ...valid, presentation }).presentation, presentation);
    }
  }
  assert.equal(createBouquetSchema.safeParse({ ...valid, presentation: { tag: "x".repeat(41) } }).success, false);
  assert.equal(createBouquetSchema.safeParse({ ...valid, presentation: { ribbon: "unknown" } }).success, false);
  assert.equal(createBouquetSchema.safeParse({ ...valid, presentation: { wrapping: "unknown" } }).success, false);
});

test("flower limits and catalog IDs are validated server-side", () => {
  for (const count of [-1, 0, 5, 11, 1.5]) {
    assert.equal(createBouquetSchema.safeParse({ ...valid, flowers: [{ id: 1, count }] }).success, false);
  }
  assert.equal(createBouquetSchema.safeParse({ ...valid, flowers: [{ id: 99, count: 6 }] }).success, false);
  assert.equal(createBouquetSchema.safeParse({ ...valid, flowers: [{ id: 1, count: 3 }, { id: 1, count: 3 }] }).success, false);
  assert.equal(createBouquetSchema.safeParse({ ...valid, mode: "../../secret" }).success, false);
  assert.equal(createBouquetSchema.safeParse({ ...valid, greenery: 3 }).success, false);
});

test("arrangement must be a permutation of all individual flowers", () => {
  for (const flowerOrder of [[], [0, 1], [0, 0, 2, 3, 4, 5], [0, 1, 2, 3, 4, 6]]) {
    assert.equal(createBouquetSchema.safeParse({ ...valid, flowerOrder }).success, false);
  }
});

test("message and name length limits are enforced", () => {
  for (const [field, length] of [["sender", 81], ["recipient", 81], ["message", 2001]] as const) {
    assert.equal(createBouquetSchema.safeParse({ ...valid, letter: { ...valid.letter, [field]: "x".repeat(length) } }).success, false);
  }
  assert.equal(createBouquetSchema.safeParse({ ...valid, letter: { ...valid.letter, message: "x".repeat(2000) } }).success, true);
});

test("HTML remains plain text, with no rich-HTML interpretation", () => {
  const message = '<script>alert("no")</script>';
  assert.equal(createBouquetSchema.parse({ ...valid, letter: { ...valid.letter, message } }).letter.message, message);
  // Rendering uses React text nodes; no dangerouslySetInnerHTML.
});

test("share IDs allow original UUIDs and new random IDs, not path traversal", () => {
  for (const id of ["ab_CD-123", "123", "127178c1-f9b8-4dca-a490-38c752ed9494"]) assert.equal(shareIdSchema.safeParse(id).success, true);
  for (const id of ["", "../secret", "x".repeat(129), "a/b"]) assert.equal(shareIdSchema.safeParse(id).success, false);
});

test("mixed-quantity arrangement indices no longer collide", () => {
  const selections = [{ id: 1, count: 2 }, { id: 2, count: 3 }, { id: 3, count: 1 }];
  const indices = selections.flatMap((f, fi) => Array.from({ length: f.count }, (_, i) => getFlowerInstanceIndex(selections, fi, i)));
  assert.deepEqual(indices, [0, 1, 2, 3, 4, 5]);
  assert.equal(calculateTotalFlowers(selections), 6);
  assert.equal(validateFlowerCount(selections), true);
  assert.deepEqual(generateDefaultFlowerOrder(selections), indices);
  assert.equal(validateFlowerCount([{ id: 1, count: 11 }]), false);
  assert.equal(getFlowerRotation(4), getFlowerRotation(4));
});
