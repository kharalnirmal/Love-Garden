import { NextRequest, NextResponse } from "next/server";
import { createBouquetSchema } from "@/lib/bouquet-validation";
import { createBouquet } from "@/lib/bouquet-repository";
import { consumeWriteLimit } from "@/lib/write-rate-limit";
import { isAllowedBouquetOrigin } from "@/lib/request-origin";
import { getAppOrigin } from "@/lib/app-origin";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!isAllowedBouquetOrigin(origin, request.url, {
    appOrigin: getAppOrigin(),
    nodeEnv: process.env.NODE_ENV,
    vercel: process.env.VERCEL,
    vercelUrl: process.env.VERCEL_URL,
    vercelProductionUrl: process.env.VERCEL_PROJECT_PRODUCTION_URL,
  })) {
    return NextResponse.json({ error: "Please save your bouquet from this website." }, { status: 403 });
  }
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json({ error: "Expected JSON." }, { status: 415 });
  }
  // Bound the actual streamed body, not just the untrusted Content-Length header.
  const reader = request.body?.getReader();
  if (!reader) return NextResponse.json({ error: "Missing bouquet." }, { status: 400 });
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 16384) {
        await reader.cancel();
        return NextResponse.json({ error: "Your bouquet is too large." }, { status: 413 });
      }
      chunks.push(value);
    }
  } catch {
    return NextResponse.json({ error: "Could not read your bouquet." }, { status: 400 });
  }
  let input: unknown;
  try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
  catch { return NextResponse.json({ error: "Invalid JSON." }, { status: 400 }); }
  const parsed = createBouquetSchema.safeParse(input);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 422 });
  }
  try {
    const limit = await consumeWriteLimit(request.headers);
    if (!limit.allowed) {
      return NextResponse.json({ error: "You've sent a few bouquets. Please try again later." },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
    }
    const id = await createBouquet(parsed.data);
    return NextResponse.json({ id, path: `/bouquet/${id}` }, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch {
    // Do not log messages, credentials, raw driver errors, or request bodies.
    console.error("Bouquet save unavailable; check server database/rate-limit configuration.");
    return NextResponse.json({ error: "Saving is temporarily unavailable. Your bouquet is still here; please try again." }, { status: 503 });
  }
}
