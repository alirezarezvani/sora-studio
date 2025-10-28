/**
 * Integration tests for error handling
 */

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { errorHandler, notFoundHandler, BadRequestError, NotFoundError } from '../../src/middleware/errorHandler.js';

// Create a minimal test app
const app = express();
app.use(express.json());

// Test routes that throw errors
app.get('/test/bad-request', () => {
  throw new BadRequestError('Test bad request');
});

app.get('/test/not-found', () => {
  throw new NotFoundError('Test resource not found');
});

app.get('/test/generic-error', () => {
  throw new Error('Generic test error');
});

// 404 handler
app.use(notFoundHandler);

// Error handler (must be last)
app.use(errorHandler);

describe('Error Handling', () => {
  describe('Custom Error Classes', () => {
    it('should handle BadRequestError with 400 status', async () => {
      const response = await request(app).get('/test/bad-request');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('message', 'Test bad request');
      expect(response.body.error).toHaveProperty('code', 'BAD_REQUEST');
      expect(response.body.error).toHaveProperty('statusCode', 400);
    });

    it('should handle NotFoundError with 404 status', async () => {
      const response = await request(app).get('/test/not-found');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('message', 'Test resource not found');
      expect(response.body.error).toHaveProperty('code', 'NOT_FOUND');
    });

    it('should handle generic errors with 500 status', async () => {
      const response = await request(app).get('/test/generic-error');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.statusCode).toBe(500);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for unknown routes', async () => {
      const response = await request(app).get('/unknown/route');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error.message).toContain('Route not found');
      expect(response.body.error.message).toContain('GET');
      expect(response.body.error.message).toContain('/unknown/route');
    });

    it('should include correct HTTP method in 404 error', async () => {
      const response = await request(app).post('/unknown/route');

      expect(response.status).toBe(404);
      expect(response.body.error.message).toContain('POST');
    });
  });

  describe('Error Response Format', () => {
    it('should return consistent error structure', async () => {
      const response = await request(app).get('/test/bad-request');

      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('statusCode');
    });

    it('should include stack trace in development mode', async () => {
      // Set to development mode
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      const response = await request(app).get('/test/generic-error');

      if (process.env.NODE_ENV === 'development') {
        expect(response.body.error).toHaveProperty('stack');
      }

      // Restore
      process.env.NODE_ENV = originalEnv;
    });

    it('should not include stack trace in production mode', async () => {
      // Set to production mode
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';

      const response = await request(app).get('/test/generic-error');

      expect(response.body.error.stack).toBeUndefined();

      // Restore
      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('Content-Type headers', () => {
    it('should return JSON content type for errors', async () => {
      const response = await request(app).get('/test/bad-request');

      expect(response.headers['content-type']).toMatch(/json/);
    });
  });
});
