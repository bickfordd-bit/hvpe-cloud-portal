const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

// Minimal clone of metro-config's exclusionList to avoid deep imports blocked by package exports.
const escapeStringForRegex = (pattern) =>
  pattern.replace(/[\-\[\]{}()*+?.\\^$|]/g, '\\$&').replaceAll('/', `\\${path.sep}`);

const makeBlockList = (patterns) =>
  new RegExp(
    `(${patterns
      .map((p) => (p instanceof RegExp ? p.source.replace(/\//g, `\\${path.sep}`) : escapeStringForRegex(p)))
      .join('|')})$`,
  );

const config = getDefaultConfig(__dirname);

// Block server-only code (API routes, Prisma, Node stdlib usage) from the RN bundle
config.resolver.blockList = makeBlockList([
  /src\/app\/api\/.*/, // API/Next routes with fs/path/child_process/prisma
  /src\/lib\/prisma\/.*/, // Prisma client/server-only code
]);

module.exports = config;
