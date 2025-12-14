import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  
  // Enable standalone output for Docker deployment
  output: 'standalone',
  
  // Disable telemetry in production
  experimental: {
    instrumentationHook: false,
  },
};

export default nextConfig;
