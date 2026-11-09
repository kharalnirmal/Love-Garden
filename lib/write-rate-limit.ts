import "server-only";
import { createHmac } from "node:crypto";
import { withDb } from "@/lib/db";

export async function consumeWriteLimit(headers: Headers) {
  const secret = process.env.RATE_LIMIT_SECRET;
  if (!secret || secret.length < 32) throw new Error("RATE_LIMIT_NOT_CONFIGURED");
  // Vercel overwrites this header. Never trust arbitrary x-forwarded-for.
  // Outside Vercel use one shared bucket until a trusted proxy is configured.
  const identity = process.env.VERCEL === "1"
    ? headers.get("x-vercel-forwarded-for")?.split(",")[0].trim() || "shared"
    : "local-shared";
  const now = Date.now();
  const bucket = Math.floor(now / 3600000);
  const expiresAt = new Date((bucket + 1) * 3600000);
  const key = createHmac("sha256", secret).update(`${identity}:${bucket}`).digest("hex");
  // Atomic conditional UPSERT works across serverless instances, unlike memory maps.
  const result = await withDb((db) => db.$queryRaw<{ count: number }[]>`
    INSERT INTO "write_rate_limits" ("key", "count", "expiresAt")
    VALUES (${key}, 1, ${expiresAt})
    ON CONFLICT ("key") DO UPDATE SET "count" = "write_rate_limits"."count" + 1
    WHERE "write_rate_limits"."count" < 5
    RETURNING "count"
  `);
  return { allowed: result.length > 0, retryAfter: Math.ceil((expiresAt.getTime() - now) / 1000) };
}
