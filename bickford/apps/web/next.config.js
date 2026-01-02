/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@bickford/shared'],
  output: 'standalone',
}

module.exports = nextConfig
