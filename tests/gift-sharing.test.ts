import { test } from "node:test";
import assert from "node:assert/strict";
import jsQR from "jsqr";
import { PNG } from "pngjs";
import { giftUrl } from "../lib/gift-sharing";
import { giftQrPng, giftQrSvg } from "../lib/gift-qr";

test("gift URLs use a configured origin, not a forwarded request host", () => {
  assert.equal(giftUrl("Ab_c-123", "https://garden.example"), "https://garden.example/gift/Ab_c-123");
  assert.equal(giftUrl("abc", "http://localhost:3000"), "http://localhost:3000/gift/abc");
  for (const origin of [undefined, "http://unsafe.example", "https://user:secret@garden.example", "https://garden.example/path", "https://garden.example/?query=1", "https://garden.example/#fragment", "javascript:alert(1)"]) {
    assert.throws(() => giftUrl("abc", origin));
  }
  assert.throws(() => giftUrl("../secret", "https://garden.example"));
});

test("pink PNG exports decode to the exact gift URL, including long IDs", async () => {
  for (const id of ["aB_1234567890-qr", "x".repeat(128)]) {
    const url = giftUrl(id, "https://garden.example");
    const png = PNG.sync.read(await giftQrPng(url));
    assert.equal(png.width, 768);
    assert.equal(png.height, 768);
    assert.equal(jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data, url);
    assert.deepEqual([...png.data.subarray(0, 4)], [255, 255, 255, 255], "Quiet zone must remain white");
  }
});

test("SVG exports rasterize and decode to the exact gift URL", async () => {
  const url = giftUrl("svg-test-1234567890", "https://garden.example");
  const svg = await giftQrSvg(url);
  assert.match(svg, /stroke="#742F50"/);
  assert.ok(!svg.includes("<script"));
  // Rasterize qrcode's horizontal SVG strokes to verify the actual exported
  // paths, independently of the PNG encoder. Supported commands: M, m, h.
  const size = Number(svg.match(/viewBox="0 0 (\d+)/)?.[1]);
  const path = svg.match(/stroke="[^"]+" d="([^"]+)"/)?.[1];
  assert.ok(path && size > 0);
  const scale = 8;
  const width = size * scale;
  const pixels = new Uint8ClampedArray(width * width * 4).fill(255);
  let x = 0;
  let y = 0;
  for (const token of path.matchAll(/([Mmh])([\d.]+)(?: ([\d.]+))?/g)) {
    const value = Number(token[2]);
    if (token[1] === "M") { x = value; y = Number(token[3]); }
    else if (token[1] === "m") { x += value; y += Number(token[3]); }
    else {
      for (let row = Math.floor(y) * scale; row < (Math.floor(y) + 1) * scale; row++) {
        for (let col = x * scale; col < (x + value) * scale; col++) {
          const offset = (row * width + col) * 4;
          pixels.set([116, 47, 80, 255], offset);
        }
      }
      x += value;
    }
  }
  assert.equal(jsQR(pixels, width, width)?.data, url);
});
