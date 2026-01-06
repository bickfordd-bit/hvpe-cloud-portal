import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  collectCoverageFrom: [
    "src/lib/**/*.ts",
    "!src/lib/**/*.d.ts",
    "!src/lib/**/__tests__/**",
  ],
  coverageThreshold: {
    global: {
      // TODO: Increase to 80% as test coverage improves
      branches: 3,
      functions: 10,
      lines: 7,
      statements: 7,
    },
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
};

export default createJestConfig(config);
