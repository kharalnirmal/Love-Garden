import { ImageResponse } from "next/og";
import { getBouquetPreviewById } from "@/lib/bouquet-repository";
import { flowers } from "@/data/data";
import { socialImageSize, socialPreview } from "@/lib/social-preview";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const alt = "Someone sent you flowers. Open your Love Garden bouquet.";
export const size = socialImageSize;
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
  return new ImageResponse(
    await socialPreview({ names: blooms, mode, gift: true }),
    { ...size, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } },
  );
}
