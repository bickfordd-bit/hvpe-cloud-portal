// Metro configuration for React Native + Next.js hybrid
// Excludes Next.js API routes from mobile bundles

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Exclude API routes and server-only code from React Native bundles
// Using blockList (newer API) instead of blacklistRE
config.resolver.blockList = [
  // Exclude all Next.js API routes
  /src\/app\/api\/.*/,
  // Exclude middleware (server-only)
  /middleware\.ts$/,
  // Exclude Prisma client (Node.js only, uses fs module)
  /src\/lib\/prisma\.ts$/,
  /\/prisma\/.*/,
];

// Prioritize React Native resolution over Node.js modules
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Exclude Node.js built-in modules from bundling
config.resolver.extraNodeModules = {
  fs: path.resolve(__dirname, 'node_modules/react-native-fs'),
  path: require.resolve('path-browserify'),
  crypto: require.resolve('crypto-browserify'),
  stream: require.resolve('stream-browserify'),
  // Stub out other Node.js modules that might be imported
  child_process: false,
  net: false,
  tls: false,
  // Block @prisma/client from being resolved in RN
  '@prisma/client': false,
};

module.exports = config;
