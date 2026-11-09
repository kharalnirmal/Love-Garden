import assert from "node:assert/strict";
import test from "node:test";
import { toPublicDesign } from "../lib/public-bouquet";

test("garden output contains design only, never gift IDs, names, message, or tag", () => {
  const row = {
    id: "private-gift-id", gardenId: "unrelated-public-design", mode: "color",
    flowers: [{ id: 1, count: 6 }], flowerOrder: [0, 1, 2, 3, 4, 5],
    greenery: 1, timestamp: BigInt(1), createdAt: new Date(0),
    letter: { sender: "PRIVATE_SENDER", recipient: "PRIVATE_RECIPIENT", message: "PRIVATE_MESSAGE" },
    presentation: { ribbon: "sage", wrapping: "blush", tag: "PRIVATE_TAG", card: "blush" },
  };
  const result = toPublicDesign(row);
  assert.equal(result.id, row.gardenId);
  assert.deepEqual(result.letter, { sender: "", recipient: "", message: "" });
  assert.deepEqual(result.presentation, { ribbon: "sage", wrapping: "blush", tag: "", card: "classic" });
  for (const privateValue of [row.id, ...Object.values(row.letter), row.presentation.tag]) {
    assert.equal(JSON.stringify(result).includes(privateValue), false);
  }
});
