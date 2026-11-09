import { ImageResponse } from "next/og";
import { socialImageSize, socialPreview } from "@/lib/social-preview";

export const runtime = "nodejs";
export const alt = "Love Garden — Say it with flowers. Illustrated flowers on cream and sage stationery.";
export const size = socialImageSize;
export const contentType = "image/png";

export default async function OpenGraphImage() {
  return new ImageResponse(await socialPreview(), size);
}
