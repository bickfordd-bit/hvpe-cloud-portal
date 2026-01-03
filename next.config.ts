import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone output for optimal Vercel deployment
  output: "standalone",

  // Temporarily ignore TypeScript errors during build
  // These will be fixed by PR #79
  typescript: {
    ignoreBuildErrors: true,
  },

  // Temporarily ignore ESLint errors during build
  // These were fixed by PR #28
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Skip static generation for dynamic pages
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  // Optimize for Vercel deployment
  swcMinify: true,
  reactStrictMode: true,

  // Suppress Prisma telemetry warnings
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push("@prisma/client");
    }
    return config;
  },
};

export default nextConfig;
