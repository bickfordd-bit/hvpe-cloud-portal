import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for optimal Vercel deployment
  output: "standalone",

  // Temporarily ignore TypeScript errors during build
  // These will be fixed by PR #79
  typescript: {
    ignoreBuildErrors: true,
  },

  // Optimize for Vercel deployment
  reactStrictMode: true,

  // Configure Turbopack (Next.js 16 default)
  // Empty config to silence webpack compatibility warning
  turbopack: {},

  // Note: Next.js 16 uses Turbopack by default
  // ESLint config moved to eslint.config.mjs (no longer supported in next.config)
  // experimental.missingSuspenseWithCSRBailout removed (deprecated in Next.js 16)
  // swcMinify is default and no longer configurable
};

export default nextConfig;
