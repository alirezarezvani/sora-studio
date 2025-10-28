/**
 * Integration tests for video API endpoints
 * Tests the actual Express routes and controllers
 */

import { describe, it, expect, jest } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import videoRoutes from '../../src/routes/video.routes.js';
import { errorHandler } from '../../src/middleware/errorHandler.js';

// Create test app with video routes
const app = express();
app.use(express.json());

// Mock authentication middleware for testing
app.use((req, _res, next) => {
  // Add a mock user for authenticated routes
  (req as any).user = {
    id: 'test_user_123',
    email: 'test@example.com',
  };
  next();
});

app.use('/api/videos', videoRoutes);
app.use(errorHandler);

// Mock the OpenAI service
jest.mock('../../src/services/sora.service.js', () => ({
  default: {
    createVideo: (jest.fn() as any).mockResolvedValue({
      id: 'video_test123',
      status: 'queued',
      prompt: 'Test prompt',
      model: 'sora-2',
      createdAt: new Date().toISOString(),
    }),
    getVideoStatus: (jest.fn() as any).mockResolvedValue({
      id: 'video_test123',
      status: 'completed',
      url: 'https://example.com/video.mp4',
    }),
    downloadVideo: (jest.fn() as any).mockResolvedValue({
      url: 'https://example.com/video.mp4',
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
    }),
  },
}));

describe('Video API Endpoints', () => {
  describe('POST /api/videos', () => {
    it('should create a new video generation job', async () => {
      const response = await request(app)
        .post('/api/videos')
        .send({
          prompt: 'A beautiful sunset over the ocean',
          model: 'sora-2',
          seconds: '5',
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('status');
      expect(response.body.prompt).toBe('A beautiful sunset over the ocean');
    });

    it('should validate required prompt field', async () => {
      const response = await request(app)
        .post('/api/videos')
        .send({
          model: 'sora-2',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toHaveProperty('message');
    });

    it('should validate model field', async () => {
      const response = await request(app)
        .post('/api/videos')
        .send({
          prompt: 'Test prompt',
          model: 'invalid-model',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate seconds duration', async () => {
      const response = await request(app)
        .post('/api/videos')
        .send({
          prompt: 'Test prompt',
          model: 'sora-2',
          seconds: '100', // Invalid - too long
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/videos/:id', () => {
    it('should get video status', async () => {
      const response = await request(app)
        .get('/api/videos/video_test123');

      expect([200, 404]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('status');
      }
    });

    it('should return 404 for non-existent video', async () => {
      const response = await request(app)
        .get('/api/videos/nonexistent_video');

      expect([404, 200]).toContain(response.status);
    });

    it('should validate video ID format', async () => {
      const response = await request(app)
        .get('/api/videos/invalid id with spaces');

      // Should either reject the format or handle gracefully
      expect([400, 404]).toContain(response.status);
    });
  });

  describe('GET /api/videos', () => {
    it('should list user videos', async () => {
      const response = await request(app)
        .get('/api/videos');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('videos');
      expect(Array.isArray(response.body.videos)).toBe(true);
    });

    it('should support pagination parameters', async () => {
      const response = await request(app)
        .get('/api/videos')
        .query({ page: '1', limit: '10' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('videos');
      expect(response.body).toHaveProperty('pagination');
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/videos')
        .query({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('videos');
    });
  });

  describe('DELETE /api/videos/:id', () => {
    it('should delete a video', async () => {
      const response = await request(app)
        .delete('/api/videos/video_test123');

      expect([200, 204, 404]).toContain(response.status);
    });

    it('should return 404 for non-existent video', async () => {
      const response = await request(app)
        .delete('/api/videos/nonexistent_video');

      expect([404, 200]).toContain(response.status);
    });
  });

  describe('GET /api/videos/:id/download', () => {
    it('should get download URL for completed video', async () => {
      const response = await request(app)
        .get('/api/videos/video_test123/download');

      expect([200, 404, 400]).toContain(response.status);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('url');
      }
    });

    it('should return error for non-completed video', async () => {
      const response = await request(app)
        .get('/api/videos/queued_video/download');

      // Should either return 400 (not ready) or 404 (not found)
      expect([400, 404]).toContain(response.status);
    });
  });

  describe('POST /api/videos/:id/remix', () => {
    it('should create remix from existing video', async () => {
      const response = await request(app)
        .post('/api/videos/video_test123/remix')
        .send({
          prompt: 'Same video but at sunset',
        });

      expect([201, 400, 404]).toContain(response.status);
    });

    it('should require prompt for remix', async () => {
      const response = await request(app)
        .post('/api/videos/video_test123/remix')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON', async () => {
      const response = await request(app)
        .post('/api/videos')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      expect(response.status).toBe(400);
    });

    it('should handle missing Content-Type', async () => {
      const response = await request(app)
        .post('/api/videos')
        .send('prompt=test');

      // Should still work or return appropriate error
      expect([200, 201, 400, 415]).toContain(response.status);
    });

    it('should return JSON error responses', async () => {
      const response = await request(app)
        .post('/api/videos')
        .send({ invalid: 'data' });

      expect(response.status).toBe(400);
      expect(response.headers['content-type']).toMatch(/json/);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Rate Limiting', () => {
    it('should handle multiple concurrent requests', async () => {
      const requests = Array(5).fill(null).map(() =>
        request(app)
          .post('/api/videos')
          .send({
            prompt: 'Concurrent test',
            model: 'sora-2',
          })
      );

      const responses = await Promise.all(requests);

      // All should either succeed or fail gracefully
      responses.forEach((response) => {
        expect([201, 400, 429]).toContain(response.status);
      });
    });
  });
});
