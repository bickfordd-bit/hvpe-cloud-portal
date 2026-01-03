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

  // Optimize for Vercel
  reactStrictMode: true,

  // Turbopack configuration (Next.js 16 default bundler)
  // Empty config to silence webpack compatibility warning
  turbopack: {},

  // Handle Prisma in serverless environment (for webpack builds)
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize Prisma client to prevent bundling issues
      config.externals = config.externals || [];
      if (Array.isArray(config.externals)) {
        config.externals.push("@prisma/client");
      } else {
        // Handle other externals formats
        const originalExternals = config.externals;
        config.externals = ["@prisma/client", originalExternals];
      }
    }
    return config;
  },
};

export default nextConfig;
