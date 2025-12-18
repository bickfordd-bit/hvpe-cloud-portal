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

// Block server-only code (API routes, Prisma, Node stdlib usage) from the RN/Shell bundle
const serverOnlyDirs = [
  path.join(__dirname, "src", "app", "api"),
  path.join(__dirname, "build", "src", "app", "api"),
  path.join(__dirname, "src", "lib", "prisma"),
  path.join(__dirname, "build", "src", "lib", "prisma"),
];

const dirPattern = (dir) =>
  dir
    .split(path.sep)
    .map((segment) => escapeStringForRegex(segment))
    .join("[/\\\\]");

config.resolver.blockList = makeBlockList([
  ...serverOnlyDirs.map((dir) => new RegExp(`${dirPattern(dir)}([\\\\/].*)?$`)),
]);

module.exports = config;
