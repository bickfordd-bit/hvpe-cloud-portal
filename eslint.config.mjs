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
    // Build artifacts and node modules
    "**/dist/**",
    "**/node_modules/**",
    "**/coverage/**",
    // Expo/React Native
    "android/**",
    "ios/**",
    ".expo/**",
    // Bickford subprojects
    "bickford/**",
    "packages/**/dist/**",
  ]),
  {
    rules: {
      // Allow any type in catch clauses - TypeScript doesn't provide good error types
      '@typescript-eslint/no-explicit-any': [
        'error',
        {
          ignoreRestArgs: false,
        },
      ],
      // Allow unused vars that start with underscore
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['**/*.js', '**/*.cjs'],
    rules: {
      // Allow require() in .js files (CommonJS)
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
]);

export default eslintConfig;
