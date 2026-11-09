/** @type {import('next').NextConfig} */
const nextConfig = {
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
