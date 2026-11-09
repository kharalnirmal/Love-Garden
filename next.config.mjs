/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Gift URLs are bearer secrets; never send them in Referer headers.
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      ...["/gift/:path*", "/bouquet/:path*"].map((source) => ({
        source,
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow, noarchive, nosnippet" },
          { key: "Cache-Control", value: "private, no-store, max-age=0" },
        ],
      })),
    ];
  },
  outputFileTracingIncludes: {
    "/opengraph-image": ["./public/color/flowers/*.png"],
    "/gift/**": ["./public/color/flowers/*.png", "./public/mono/flowers/*.png"],
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
};
export default nextConfig;
