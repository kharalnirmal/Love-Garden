import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getBouquetPreviewById } from "@/lib/bouquet-repository";
import { flowers } from "@/data/data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Someone sent you flowers. Open your Love Garden bouquet.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function GiftImage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const bouquet = await getBouquetPreviewById(id);
  if (!bouquet) return new Response("Gift not found", { status: 404 });
  const mode = bouquet.mode === "mono" ? "mono" : "color";
  const blooms = bouquet.flowers.flatMap((selected) => {
    const flower = flowers.find((item) => item.id === selected.id);
    return flower ? Array.from({ length: selected.count }, () => flower.name) : [];
  }).slice(0, 5);
  const images = await Promise.all(blooms.map(async (name) => {
    // Names come from the fixed local catalog, never request paths or private text.
    const buffer = await readFile(join(process.cwd(), "public", mode, "flowers", `${name}.png`));
    return `data:image/png;base64,${buffer.toString("base64")}`;
  }));
  return new ImageResponse(
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", height: "100%", background: "#faf7f2", color: "#683748", padding: 40 }}>
      <div style={{ fontSize: 24, letterSpacing: 4 }}>LOVE GARDEN</div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 340 }}>
        {/* ImageResponse uses native img elements with embedded local assets. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {images.map((src, index) => <img key={index} src={src} alt="" width={190} height={230} style={{ objectFit: "contain", transform: `rotate(${index % 2 ? 9 : -9}deg)` }} />)}
      </div>
      <div style={{ fontSize: 54 }}>A little love, just for you.</div>
      <div style={{ fontSize: 22, color: "#68705f", marginTop: 18 }}>Open your bouquet</div>
    </div>,
    { ...size, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } },
  );
}
