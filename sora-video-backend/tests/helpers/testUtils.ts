/**
 * Test utilities and helpers
 */

import { Pool } from 'pg';

/**
 * Create a mock database pool for testing
 */
export function createMockPool(): jest.Mocked<Pool> {
  return {
    query: jest.fn(),
    connect: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  } as any;
}

/**
 * Create a mock Redis client for testing
 */
export function createMockRedis() {
  return {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    ping: jest.fn(),
    isOpen: true,
    connect: jest.fn(),
    disconnect: jest.fn(),
    on: jest.fn(),
  };
}

/**
 * Create a mock Express request
 */
export function createMockRequest(overrides: any = {}) {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    user: null,
    ip: '127.0.0.1',
    method: 'GET',
    path: '/',
    get: jest.fn((header: string) => {
      return overrides[header] || null;
    }),
    ...overrides,
  };
}

/**
 * Create a mock Express response
 */
export function createMockResponse() {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    on: jest.fn(),
    statusCode: 200,
  };
  return res;
}

/**
 * Create a mock Express next function
 */
export function createMockNext() {
  return jest.fn();
}

/**
 * Mock video job data
 */
export const mockVideoJob = {
  id: 'video_test123',
  model: 'sora-2',
  status: 'completed',
  progress: 100,
  prompt: 'A beautiful sunset over mountains',
  size: '1920x1080',
  seconds: '5',
  quality: 'standard',
  file_url: 'https://example.com/video.mp4',
  thumbnail_url: 'https://example.com/thumbnail.jpg',
  created_at: 1699564800,
  completed_at: 1699564900,
  expires_at: 1699568500,
};

/**
 * Mock user data
 */
export const mockUser = {
  id: 'user_test123',
  email: 'test@example.com',
  name: 'Test User',
};

/**
 * Mock quota data
 */
export const mockQuota = {
  user_id: 'user_test123',
  videos_created: 5,
  videos_limit: 10,
  estimated_cost: 2.5,
  period_start: new Date('2025-10-01'),
  period_end: new Date('2025-10-31'),
};

/**
 * Wait for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Clean up test database
 */
export async function cleanupTestDatabase(pool: Pool) {
  await pool.query('DELETE FROM video_events');
  await pool.query('DELETE FROM videos');
  await pool.query('DELETE FROM user_quotas');
}
