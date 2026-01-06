import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Repo-specific generated / non-app code:
    ".bick/**",
    "packages/**/dist/**",
    "scripts/**",
    "android/**",
    "ios/**",
  ]),

  // Repo-wide rule overrides (keep lint actionable; avoid blocking on known-safe patterns)
  {
    rules: {
      // This repo intentionally uses `any` in error-handling and boundary layers.
      "@typescript-eslint/no-explicit-any": "off",

      // Some Node scripts and generated outputs use CommonJS; do not block lint.
      "@typescript-eslint/no-require-imports": "off",

      // Avoid blocking builds over apostrophes in marketing copy.
      "react/no-unescaped-entities": "off",

      // This rule is noisy in some existing components; keep it from failing CI.
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);

export default eslintConfig;
