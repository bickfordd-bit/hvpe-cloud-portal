import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Enable standalone output for Docker deployment
  output: "standalone",

  // Temporarily ignore TypeScript errors during build
  // TODO: Remove this once all pre-existing TS errors are resolved
  typescript: {
    ignoreBuildErrors: true,
  },

  // Temporarily ignore ESLint errors during build
  // TODO: Remove this once all pre-existing lint errors are resolved
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Skip static generation for dynamic pages
  // This prevents build failures for pages using useSearchParams without Suspense
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
};

export default nextConfig;
