import type { Metadata } from "next";
import { giftUrl } from "@/lib/gift-sharing";
import { shareIdSchema } from "@/lib/bouquet-validation";

export const siteTitle = "Love Garden — Say it with flowers";
export const siteDescription = "Create a bouquet, tuck in a handwritten note, and send someone a little love. A beautiful surprise, shared with a link or QR code.";
export const giftTitle = "A little love, just for you";
export const giftDescription = "Someone picked these flowers just for you. Open your bouquet—there’s a little note waiting inside.";

export function giftMetadata(id: string): Metadata {
  const url = process.env.APP_ORIGIN && shareIdSchema.safeParse(id).success ? giftUrl(id, process.env.APP_ORIGIN) : undefined;
  const images = url ? [{ url: `${url}/opengraph-image`, width: 1200, height: 630, alt: "A bouquet and a little love, just for you. Open your Love Garden surprise." }] : undefined;
  return {
    title: giftTitle,
    description: giftDescription,
    robots: { index: false, follow: false },
    ...(url ? { alternates: { canonical: url } } : {}),
    openGraph: { type: "website", siteName: "Love Garden", title: giftTitle, description: giftDescription, url, images },
    twitter: { card: "summary_large_image", title: giftTitle, description: giftDescription, images },
  };
}
