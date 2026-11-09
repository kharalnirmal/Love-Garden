import { giftUrl } from "./gift-sharing";

export const publicAppOrigin = "https://lovebouquet.vercel.app";

export function getAppOrigin(config = { appOrigin: process.env.APP_ORIGIN, nodeEnv: process.env.NODE_ENV }) {
  const configured = config.appOrigin;
  if (!configured) return config.nodeEnv === "development" ? "http://localhost:3000" : publicAppOrigin;
  // Reuse the strict URL validation; never derive canonical links from request headers.
  const origin = new URL(giftUrl("preview", configured)).origin;
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(new URL(origin).hostname);
  return config.nodeEnv === "production" && local ? publicAppOrigin : origin;
}
