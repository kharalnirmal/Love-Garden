import { shareIdSchema } from "./bouquet-validation";

export function giftUrl(id: string, origin: string | undefined): string {
  if (!shareIdSchema.safeParse(id).success) throw new Error("INVALID_GIFT_ID");
  if (!origin) throw new Error("APP_ORIGIN_NOT_CONFIGURED");
  const base = new URL(origin);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
  if ((base.protocol !== "https:" && !(local && base.protocol === "http:")) ||
      base.username || base.password || base.pathname !== "/" || base.search || base.hash) {
    throw new Error("INVALID_APP_ORIGIN");
  }
  return new URL(`/gift/${encodeURIComponent(id)}`, base).href;
}
