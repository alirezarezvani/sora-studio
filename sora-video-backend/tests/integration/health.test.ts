/**
 * Integration tests for health check endpoints
 */

import { describe, it, expect } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { healthCheck, readinessCheck, livenessCheck } from '../../src/middleware/healthCheck.js';

// Create a minimal test app
const app = express();
app.get('/health', healthCheck);
app.get('/health/ready', readinessCheck);
app.get('/health/live', livenessCheck);

describe('Health Check Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 and health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'ok');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('service', 'Sora Studio API');
    });

    it('should return valid timestamp', async () => {
      const response = await request(app).get('/health');

      const timestamp = new Date(response.body.timestamp);
      expect(timestamp.getTime()).toBeGreaterThan(0);
      expect(timestamp.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should return numeric uptime', async () => {
      const response = await request(app).get('/health');

      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /health/ready', () => {
    it('should return health status with dependency checks', async () => {
      const response = await request(app).get('/health/ready');

      // May be 200 (healthy) or 503 (unhealthy) depending on actual services
      expect([200, 503]).toContain(response.status);
      expect(response.body).toHaveProperty('status');
      expect(['healthy', 'degraded', 'unhealthy']).toContain(response.body.status);
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('checks');
    });

    it('should include database check', async () => {
      const response = await request(app).get('/health/ready');

      expect(response.body.checks).toHaveProperty('database');
      expect(response.body.checks.database).toHaveProperty('status');
      expect(['up', 'down', 'degraded']).toContain(response.body.checks.database.status);
    });

    it('should include redis check', async () => {
      const response = await request(app).get('/health/ready');

      expect(response.body.checks).toHaveProperty('redis');
      expect(response.body.checks.redis).toHaveProperty('status');
      expect(['up', 'down', 'degraded']).toContain(response.body.checks.redis.status);
    });

    it('should include response times for successful checks', async () => {
      const response = await request(app).get('/health/ready');

      if (response.body.checks.database.status === 'up') {
        expect(response.body.checks.database).toHaveProperty('responseTime');
        expect(typeof response.body.checks.database.responseTime).toBe('number');
      }
    });
  });

  describe('GET /health/live', () => {
    it('should return 200 and liveness confirmation', async () => {
      const response = await request(app).get('/health/live');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'alive');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('pid');
    });

    it('should return valid process ID', async () => {
      const response = await request(app).get('/health/live');

      expect(typeof response.body.pid).toBe('number');
      expect(response.body.pid).toBeGreaterThan(0);
      expect(response.body.pid).toBe(process.pid);
    });

    it('should respond quickly (< 100ms)', async () => {
      const start = Date.now();
      await request(app).get('/health/live');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });
  });

  describe('Health endpoints performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array(10).fill(null).map(() =>
        request(app).get('/health')
      );

      const responses = await Promise.all(requests);

      responses.forEach((response) => {
        expect(response.status).toBe(200);
        expect(response.body.status).toBe('ok');
      });
    });
  });
});
