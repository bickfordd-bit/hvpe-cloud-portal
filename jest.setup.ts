import '@testing-library/jest-dom';

// Set up environment variables for tests
process.env.OPENAI_API_KEY = 'test-openai-key';
process.env.HVPE_OPENAI_API_KEY = 'test-hvpe-openai-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
// NODE_ENV is read-only in production builds, only set if not already defined
if (!process.env.NODE_ENV) {
  (process.env as any).NODE_ENV = 'test';
}
