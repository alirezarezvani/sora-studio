/**
 * Jest test setup
 * Runs before all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '3333'; // Different port for tests
process.env.LOG_LEVEL = 'error'; // Reduce log noise during tests

// Mock environment variables if not set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/sora_test';
}

if (!process.env.REDIS_URL) {
  process.env.REDIS_URL = 'redis://localhost:6379/1'; // Use different DB for tests
}

if (!process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = 'sk-test-mock-key-for-testing';
}

if (!process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL = 'http://localhost:3001';
}

// Increase test timeout for integration tests
jest.setTimeout(15000);

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log during tests unless VERBOSE=true
  log: process.env.VERBOSE ? console.log : jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: console.warn, // Keep warnings
  error: console.error, // Keep errors
};

// Cleanup after all tests
afterAll(async () => {
  // Give async operations time to complete
  await new Promise((resolve) => setTimeout(resolve, 500));
});
