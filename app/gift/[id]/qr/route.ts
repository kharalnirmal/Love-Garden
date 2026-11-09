import { getBouquetPreviewById } from "@/lib/bouquet-repository";
import { giftUrl } from "@/lib/gift-sharing";
import { giftQrPng, giftQrSvg } from "@/lib/gift-qr";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const format = new URL(request.url).searchParams.get("format") ?? "png";
  if (format !== "png" && format !== "svg") return new Response("Unsupported format", { status: 400 });
  const { id } = await params;
  try {
    if (!await getBouquetPreviewById(id)) return new Response("Gift not found", { status: 404 });
    const url = giftUrl(id, process.env.APP_ORIGIN);
    const content = format === "svg" ? await giftQrSvg(url) : new Uint8Array(await giftQrPng(url));
    return new Response(content, {
      headers: {
        "Content-Type": format === "svg" ? "image/svg+xml" : "image/png",
        "Content-Disposition": `attachment; filename="love-garden-qr.${format}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch {
    return new Response("QR unavailable. Please try again later.", { status: 503 });
  }
}
