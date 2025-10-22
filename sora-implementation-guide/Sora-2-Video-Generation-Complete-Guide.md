# Sora 2 Video Generation - Complete Implementation Guide

## Table of Contents
1. [Executive Summary](#executive-summary)
2. [System Architecture](#system-architecture)
3. [Project Planning & Roadmap](#project-planning--roadmap)
4. [Technical Requirements](#technical-requirements)
5. [API Documentation Overview](#api-documentation-overview)
6. [Backend Implementation](#backend-implementation)
7. [Frontend Implementation](#frontend-implementation)
8. [Advanced Features](#advanced-features)
9. [Best Practices & Optimization](#best-practices--optimization)
10. [Security & Cost Management](#security--cost-management)
11. [Testing & Monitoring](#testing--monitoring)
12. [Deployment Guide](#deployment-guide)

---

## Executive Summary

This guide provides a complete, production-ready implementation for integrating OpenAI's Sora 2 video generation model into your application. Sora 2 enables AI-powered video creation from text prompts, video remixing, and comprehensive video management capabilities.

**Key Capabilities:**
- Text-to-video generation with customizable parameters
- Video remixing and iterative refinement
- Asynchronous job processing with status tracking
- Webhook support for real-time notifications
- Multiple video format and quality options

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  React Web   │  │ React Native │  │  Admin Panel │          │
│  │  Application │  │  Mobile App  │  │  (Next.js)   │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          └──────────────────┴──────────────────┘
                             │
          ┌──────────────────▼─────────────────────┐
          │          API GATEWAY / NGINX            │
          │         (Rate Limiting, CORS)           │
          └──────────────────┬─────────────────────┘
                             │
          ┌──────────────────▼─────────────────────┐
          │          BACKEND LAYER                  │
          │   ┌─────────────────────────────┐      │
          │   │   Node.js/Express Server    │      │
          │   │  ┌──────────────────────┐   │      │
          │   │  │  Video API Routes    │   │      │
          │   │  │  - Create Video      │   │      │
          │   │  │  - Remix Video       │   │      │
          │   │  │  - Check Status      │   │      │
          │   │  │  - Download Video    │   │      │
          │   │  └──────────────────────┘   │      │
          │   │  ┌──────────────────────┐   │      │
          │   │  │  Webhook Handler     │   │      │
          │   │  └──────────────────────┘   │      │
          │   └─────────────────────────────┘      │
          └──────────────────┬─────────────────────┘
                             │
          ┌──────────────────▼─────────────────────┐
          │         DATA LAYER                      │
          │   ┌────────────┐   ┌──────────────┐   │
          │   │ PostgreSQL │   │    Redis     │   │
          │   │  (NeonDB)  │   │   (Cache &   │   │
          │   │            │   │    Queue)    │   │
          │   └────────────┘   └──────────────┘   │
          └─────────────────────────────────────────┘
                             │
          ┌──────────────────▼─────────────────────┐
          │        EXTERNAL SERVICES                │
          │   ┌────────────┐   ┌──────────────┐   │
          │   │  OpenAI    │   │  Cloud       │   │
          │   │  Sora 2    │   │  Storage     │   │
          │   │  API       │   │  (S3/R2)     │   │
          │   └────────────┘   └──────────────┘   │
          └─────────────────────────────────────────┘
          
          ┌─────────────────────────────────────────┐
          │        BACKGROUND WORKERS                │
          │   ┌────────────────────────────────┐   │
          │   │  Video Status Polling Worker   │   │
          │   │  Video Download Worker          │   │
          │   │  Cleanup Worker                 │   │
          │   └────────────────────────────────┘   │
          └─────────────────────────────────────────┘
```

### Component Responsibilities

**Frontend Layer:**
- User interface for video generation
- Real-time status updates via WebSocket/polling
- Video preview and management
- Form validation and error handling

**Backend Layer:**
- API key security and management
- Request validation and rate limiting
- OpenAI API integration
- Webhook handling
- Database operations

**Data Layer:**
- Video metadata storage (PostgreSQL)
- Job queue management (Redis)
- Caching layer for frequently accessed data

**Background Workers:**
- Asynchronous status polling
- Video content download and storage
- Cleanup of expired videos

---

## Project Planning & Roadmap

### Epic: Sora 2 Video Generation Integration

#### Phase 1: Foundation (Week 1-2)
**User Story 1.1:** As a developer, I need to set up the basic infrastructure
- **Tasks:**
  - Set up Node.js/Express backend with TypeScript
  - Configure OpenAI API client
  - Set up PostgreSQL database with NeonDB
  - Configure Redis for job queue
  - Set up environment variables and secrets management

**User Story 1.2:** As a developer, I need basic video creation functionality
- **Tasks:**
  - Implement POST /api/videos/create endpoint
  - Implement OpenAI Sora 2 API integration
  - Create database schema for video jobs
  - Implement basic error handling
  - Write unit tests for video creation

#### Phase 2: Core Features (Week 3-4)
**User Story 2.1:** As a user, I want to create videos from text prompts
- **Tasks:**
  - Build React frontend form component
  - Implement video creation UI
  - Add prompt validation
  - Display creation confirmation
  - Handle loading states

**User Story 2.2:** As a user, I want to track video generation progress
- **Tasks:**
  - Implement status polling mechanism
  - Create progress indicator UI component
  - Implement WebSocket for real-time updates
  - Add job status persistence
  - Build status dashboard

**User Story 2.3:** As a user, I want to download and view completed videos
- **Tasks:**
  - Implement video content download endpoint
  - Create video player component
  - Add video preview functionality
  - Implement video list/gallery view
  - Add download button

#### Phase 3: Advanced Features (Week 5-6)
**User Story 3.1:** As a user, I want to remix existing videos
- **Tasks:**
  - Implement remix API endpoint
  - Build remix UI interface
  - Add remix history tracking
  - Implement version control
  - Add comparison view

**User Story 3.2:** As a system, I need webhook support for async notifications
- **Tasks:**
  - Implement webhook endpoint
  - Configure webhook verification
  - Build event processing logic
  - Add retry mechanism
  - Create webhook logging

**User Story 3.3:** As an admin, I want to manage and monitor video generation
- **Tasks:**
  - Build admin dashboard
  - Add usage analytics
  - Implement cost tracking
  - Create user quota management
  - Add error reporting

#### Phase 4: Optimization & Deployment (Week 7-8)
**User Story 4.1:** As a system, I need production-ready performance
- **Tasks:**
  - Implement caching strategies
  - Add rate limiting
  - Optimize database queries
  - Implement background workers
  - Add monitoring and logging

**User Story 4.2:** As a team, we need a deployable solution
- **Tasks:**
  - Containerize application with Docker
  - Set up CI/CD pipeline
  - Configure production environment
  - Write deployment documentation
  - Perform load testing

---

## Technical Requirements

### Prerequisites
- Node.js 18+ (LTS)
- npm or yarn
- PostgreSQL 14+ (NeonDB recommended)
- Redis 6+ (optional but recommended)
- OpenAI API key with Sora 2 access

### Tech Stack
- **Backend:** Node.js, Express, TypeScript
- **Frontend:** React, Next.js, TypeScript
- **Database:** PostgreSQL (NeonDB)
- **Cache/Queue:** Redis
- **API Client:** OpenAI SDK (@openai/openai)
- **Testing:** Jest, Supertest, React Testing Library
- **Deployment:** Docker, CI/CD (GitHub Actions/CircleCI)

### Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...
OPENAI_ORG_ID=org-...
OPENAI_PROJECT_ID=proj_...

# Database
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Application
NODE_ENV=production
PORT=3000
API_BASE_URL=https://api.yourapp.com

# Webhook (optional)
WEBHOOK_SECRET=your-webhook-secret
WEBHOOK_URL=https://api.yourapp.com/webhooks/sora

# Storage (optional - for video archival)
S3_BUCKET=your-bucket
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

---

## API Documentation Overview

### Sora 2 Endpoints

#### 1. Create Video
```
POST https://api.openai.com/v1/videos
```
**Purpose:** Generate a new video from a text prompt

**Request:**
```typescript
{
  model: "sora-2",           // Required
  prompt: string,            // Required: Video description
  size?: string,             // Optional: Video resolution
  seconds?: string,          // Optional: Duration
  quality?: string,          // Optional: standard/high
}
```

**Response:**
```typescript
{
  id: string,                // Video job ID
  object: "video",
  model: "sora-2",
  status: "queued",          // queued, in_progress, completed, failed
  progress: number,          // 0-100
  created_at: number,        // Unix timestamp
  completed_at?: number,     // Unix timestamp (when done)
  size: string,              // e.g., "1024x1808"
  seconds: string,           // e.g., "8"
  quality: string,           // e.g., "standard"
  error?: object,            // Error details if failed
}
```

#### 2. Remix Video
```
POST https://api.openai.com/v1/videos/{video_id}/remix
```
**Purpose:** Create a modified version of an existing video

**Request:**
```typescript
{
  prompt: string,            // Required: Remix instructions
}
```

#### 3. List Videos
```
GET https://api.openai.com/v1/videos?limit=20&after=video_123&order=desc
```
**Purpose:** Retrieve a paginated list of video jobs

#### 4. Retrieve Video
```
GET https://api.openai.com/v1/videos/{video_id}
```
**Purpose:** Get details about a specific video job

#### 5. Delete Video
```
DELETE https://api.openai.com/v1/videos/{video_id}
```
**Purpose:** Delete a video job and its assets

#### 6. Download Video Content
```
GET https://api.openai.com/v1/videos/{video_id}/content?variant=mp4
```
**Purpose:** Download the generated video file

### Status Lifecycle
```
queued → in_progress → completed
                    ↓
                  failed
```

---

## Backend Implementation

### Step 1: Project Setup

```bash
# Create project
mkdir sora-video-backend
cd sora-video-backend

# Initialize Node.js project
npm init -y

# Install dependencies
npm install express openai dotenv cors helmet
npm install pg redis
npm install --save-dev typescript @types/node @types/express @types/cors
npm install --save-dev ts-node nodemon jest @types/jest supertest

# Initialize TypeScript
npx tsc --init
```

### Step 2: Project Structure

```
sora-video-backend/
├── src/
│   ├── config/
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   └── openai.ts
│   ├── controllers/
│   │   ├── video.controller.ts
│   │   └── webhook.controller.ts
│   ├── services/
│   │   ├── sora.service.ts
│   │   ├── video.service.ts
│   │   └── storage.service.ts
│   ├── models/
│   │   └── video.model.ts
│   ├── routes/
│   │   ├── video.routes.ts
│   │   └── webhook.routes.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── error.middleware.ts
│   ├── workers/
│   │   ├── status-poller.worker.ts
│   │   └── video-downloader.worker.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── helpers.ts
│   └── app.ts
├── tests/
│   ├── unit/
│   └── integration/
├── .env.example
├── .gitignore
├── tsconfig.json
├── package.json
└── README.md
```

### Step 3: Core Configuration Files

**`src/config/openai.ts`**
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,
  project: process.env.OPENAI_PROJECT_ID,
});

export default openai;
```

**`src/config/database.ts`**
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
  console.log('✅ Database connected');
});

pool.on('error', (err) => {
  console.error('❌ Database error:', err);
});

export default pool;
```

**`src/config/redis.ts`**
```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

export default redis;
```

### Step 4: Database Schema

**`migrations/001_create_videos_table.sql`**
```sql
-- Videos table
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    model VARCHAR(50) NOT NULL DEFAULT 'sora-2',
    status VARCHAR(50) NOT NULL DEFAULT 'queued',
    progress INTEGER DEFAULT 0,
    prompt TEXT NOT NULL,
    size VARCHAR(50),
    seconds VARCHAR(10),
    quality VARCHAR(50),
    remixed_from_video_id VARCHAR(255),
    file_url TEXT,
    thumbnail_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSONB DEFAULT '{}',
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Video events table (for audit trail)
CREATE TABLE IF NOT EXISTS video_events (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(255) NOT NULL REFERENCES videos(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_video_id (video_id),
    INDEX idx_event_type (event_type)
);

-- User quotas table
CREATE TABLE IF NOT EXISTS user_quotas (
    user_id VARCHAR(255) PRIMARY KEY,
    videos_created INTEGER DEFAULT 0,
    videos_limit INTEGER DEFAULT 100,
    reset_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 5: Type Definitions

**`src/types/index.ts`**
```typescript
export interface VideoJob {
  id: string;
  object: 'video';
  model: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  prompt?: string;
  size?: string;
  seconds?: string;
  quality?: string;
  remixed_from_video_id?: string;
  file_url?: string;
  created_at: number;
  completed_at?: number;
  expires_at?: number;
  error?: {
    code: string;
    message: string;
  };
}

export interface CreateVideoRequest {
  prompt: string;
  model?: string;
  size?: string;
  seconds?: string;
  quality?: string;
}

export interface RemixVideoRequest {
  prompt: string;
}

export interface VideoListResponse {
  data: VideoJob[];
  object: 'list';
  has_more?: boolean;
  after?: string;
}

export interface WebhookEvent {
  id: string;
  type: 'video.created' | 'video.completed' | 'video.failed';
  data: VideoJob;
  created_at: number;
}
```

### Step 6: Sora Service

**`src/services/sora.service.ts`**
```typescript
import openai from '../config/openai';
import { CreateVideoRequest, RemixVideoRequest, VideoJob } from '../types';

class SoraService {
  /**
   * Create a new video using Sora 2
   */
  async createVideo(params: CreateVideoRequest): Promise<VideoJob> {
    try {
      const response = await openai.videos.create({
        model: params.model || 'sora-2',
        prompt: params.prompt,
        ...(params.size && { size: params.size }),
        ...(params.seconds && { seconds: params.seconds }),
        ...(params.quality && { quality: params.quality }),
      });

      return response as unknown as VideoJob;
    } catch (error: any) {
      console.error('Sora API Error:', error);
      throw new Error(`Failed to create video: ${error.message}`);
    }
  }

  /**
   * Remix an existing video
   */
  async remixVideo(videoId: string, params: RemixVideoRequest): Promise<VideoJob> {
    try {
      const response = await openai.videos.remix(videoId, {
        prompt: params.prompt,
      });

      return response as unknown as VideoJob;
    } catch (error: any) {
      console.error('Sora Remix Error:', error);
      throw new Error(`Failed to remix video: ${error.message}`);
    }
  }

  /**
   * Get video status
   */
  async getVideoStatus(videoId: string): Promise<VideoJob> {
    try {
      const response = await openai.videos.retrieve(videoId);
      return response as unknown as VideoJob;
    } catch (error: any) {
      console.error('Sora Get Status Error:', error);
      throw new Error(`Failed to get video status: ${error.message}`);
    }
  }

  /**
   * List videos
   */
  async listVideos(limit: number = 20, after?: string, order: 'asc' | 'desc' = 'desc') {
    try {
      const params: any = { limit, order };
      if (after) params.after = after;

      const response = await openai.videos.list(params);
      return response;
    } catch (error: any) {
      console.error('Sora List Error:', error);
      throw new Error(`Failed to list videos: ${error.message}`);
    }
  }

  /**
   * Delete video
   */
  async deleteVideo(videoId: string): Promise<void> {
    try {
      await openai.videos.delete(videoId);
    } catch (error: any) {
      console.error('Sora Delete Error:', error);
      throw new Error(`Failed to delete video: ${error.message}`);
    }
  }

  /**
   * Download video content
   */
  async downloadVideoContent(videoId: string): Promise<Buffer> {
    try {
      const response = await openai.videos.downloadContent(videoId);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error: any) {
      console.error('Sora Download Error:', error);
      throw new Error(`Failed to download video: ${error.message}`);
    }
  }
}

export default new SoraService();
```

### Step 7: Video Service (Database Operations)

**`src/services/video.service.ts`**
```typescript
import pool from '../config/database';
import redis from '../config/redis';
import { VideoJob } from '../types';

class VideoService {
  /**
   * Save video job to database
   */
  async saveVideo(userId: string, videoJob: VideoJob): Promise<void> {
    const query = `
      INSERT INTO videos (
        id, user_id, model, status, progress, prompt, 
        size, seconds, quality, remixed_from_video_id,
        created_at, expires_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
                to_timestamp($11), to_timestamp($12))
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        progress = EXCLUDED.progress,
        completed_at = CASE 
          WHEN EXCLUDED.status = 'completed' THEN CURRENT_TIMESTAMP 
          ELSE videos.completed_at 
        END
    `;

    const values = [
      videoJob.id,
      userId,
      videoJob.model,
      videoJob.status,
      videoJob.progress,
      videoJob.prompt || '',
      videoJob.size,
      videoJob.seconds,
      videoJob.quality,
      videoJob.remixed_from_video_id,
      videoJob.created_at,
      videoJob.expires_at,
    ];

    await pool.query(query, values);

    // Cache in Redis for quick access
    await redis.setex(
      `video:${videoJob.id}`,
      3600, // 1 hour
      JSON.stringify(videoJob)
    );
  }

  /**
   * Get video by ID
   */
  async getVideo(videoId: string): Promise<VideoJob | null> {
    // Try cache first
    const cached = await redis.get(`video:${videoId}`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Query database
    const query = 'SELECT * FROM videos WHERE id = $1';
    const result = await pool.query(query, [videoId]);

    if (result.rows.length === 0) {
      return null;
    }

    const video = this.mapDbRowToVideoJob(result.rows[0]);

    // Cache result
    await redis.setex(`video:${videoId}`, 3600, JSON.stringify(video));

    return video;
  }

  /**
   * Get user's videos
   */
  async getUserVideos(
    userId: string,
    limit: number = 20,
    offset: number = 0
  ): Promise<VideoJob[]> {
    const query = `
      SELECT * FROM videos 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [userId, limit, offset]);
    return result.rows.map(row => this.mapDbRowToVideoJob(row));
  }

  /**
   * Update video status
   */
  async updateVideoStatus(videoId: string, status: string, progress: number): Promise<void> {
    const query = `
      UPDATE videos 
      SET status = $1, progress = $2,
          completed_at = CASE WHEN $1 = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END
      WHERE id = $3
    `;

    await pool.query(query, [status, progress, videoId]);

    // Invalidate cache
    await redis.del(`video:${videoId}`);
  }

  /**
   * Save video file URL
   */
  async saveVideoFile(videoId: string, fileUrl: string, thumbnailUrl?: string): Promise<void> {
    const query = `
      UPDATE videos 
      SET file_url = $1, thumbnail_url = $2
      WHERE id = $3
    `;

    await pool.query(query, [fileUrl, thumbnailUrl, videoId]);
  }

  /**
   * Log video event
   */
  async logEvent(videoId: string, eventType: string, eventData: any): Promise<void> {
    const query = `
      INSERT INTO video_events (video_id, event_type, event_data)
      VALUES ($1, $2, $3)
    `;

    await pool.query(query, [videoId, eventType, JSON.stringify(eventData)]);
  }

  /**
   * Check user quota
   */
  async checkUserQuota(userId: string): Promise<boolean> {
    const query = `
      SELECT videos_created, videos_limit 
      FROM user_quotas 
      WHERE user_id = $1
    `;

    const result = await pool.query(query, [userId]);

    if (result.rows.length === 0) {
      // Create default quota
      await this.createUserQuota(userId);
      return true;
    }

    const { videos_created, videos_limit } = result.rows[0];
    return videos_created < videos_limit;
  }

  /**
   * Increment user video count
   */
  async incrementUserVideoCount(userId: string): Promise<void> {
    const query = `
      INSERT INTO user_quotas (user_id, videos_created)
      VALUES ($1, 1)
      ON CONFLICT (user_id) DO UPDATE SET
        videos_created = user_quotas.videos_created + 1,
        updated_at = CURRENT_TIMESTAMP
    `;

    await pool.query(query, [userId]);
  }

  private async createUserQuota(userId: string): Promise<void> {
    const query = `
      INSERT INTO user_quotas (user_id, videos_created, videos_limit)
      VALUES ($1, 0, 100)
    `;

    await pool.query(query, [userId]);
  }

  private mapDbRowToVideoJob(row: any): VideoJob {
    return {
      id: row.id,
      object: 'video',
      model: row.model,
      status: row.status,
      progress: row.progress,
      prompt: row.prompt,
      size: row.size,
      seconds: row.seconds,
      quality: row.quality,
      remixed_from_video_id: row.remixed_from_video_id,
      file_url: row.file_url,
      created_at: Math.floor(new Date(row.created_at).getTime() / 1000),
      completed_at: row.completed_at 
        ? Math.floor(new Date(row.completed_at).getTime() / 1000) 
        : undefined,
      expires_at: row.expires_at 
        ? Math.floor(new Date(row.expires_at).getTime() / 1000) 
        : undefined,
      error: row.error_message ? { code: 'error', message: row.error_message } : undefined,
    };
  }
}

export default new VideoService();
```

### Step 8: Video Controller

**`src/controllers/video.controller.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';
import soraService from '../services/sora.service';
import videoService from '../services/video.service';
import { CreateVideoRequest, RemixVideoRequest } from '../types';

export class VideoController {
  /**
   * Create a new video
   * POST /api/videos
   */
  async createVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id; // Assuming auth middleware sets this
      const params: CreateVideoRequest = req.body;

      // Validate prompt
      if (!params.prompt || params.prompt.trim().length === 0) {
        return res.status(400).json({
          error: 'Prompt is required',
        });
      }

      // Check user quota
      const hasQuota = await videoService.checkUserQuota(userId);
      if (!hasQuota) {
        return res.status(429).json({
          error: 'Video generation quota exceeded',
        });
      }

      // Create video with Sora
      const videoJob = await soraService.createVideo(params);

      // Save to database
      await videoService.saveVideo(userId, videoJob);

      // Increment user count
      await videoService.incrementUserVideoCount(userId);

      // Log event
      await videoService.logEvent(videoJob.id, 'video.created', {
        userId,
        prompt: params.prompt,
      });

      res.status(201).json({
        success: true,
        data: videoJob,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remix a video
   * POST /api/videos/:videoId/remix
   */
  async remixVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { videoId } = req.params;
      const params: RemixVideoRequest = req.body;

      // Check if original video exists
      const originalVideo = await videoService.getVideo(videoId);
      if (!originalVideo) {
        return res.status(404).json({
          error: 'Original video not found',
        });
      }

      if (originalVideo.status !== 'completed') {
        return res.status(400).json({
          error: 'Original video must be completed before remixing',
        });
      }

      // Check user quota
      const hasQuota = await videoService.checkUserQuota(userId);
      if (!hasQuota) {
        return res.status(429).json({
          error: 'Video generation quota exceeded',
        });
      }

      // Remix video
      const videoJob = await soraService.remixVideo(videoId, params);

      // Save to database
      await videoService.saveVideo(userId, videoJob);

      // Increment user count
      await videoService.incrementUserVideoCount(userId);

      // Log event
      await videoService.logEvent(videoJob.id, 'video.remixed', {
        userId,
        originalVideoId: videoId,
        prompt: params.prompt,
      });

      res.status(201).json({
        success: true,
        data: videoJob,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get video status
   * GET /api/videos/:videoId
   */
  async getVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params;

      // Try database first
      let video = await videoService.getVideo(videoId);

      // If not complete, fetch latest status from Sora
      if (video && video.status !== 'completed' && video.status !== 'failed') {
        const latestStatus = await soraService.getVideoStatus(videoId);
        await videoService.saveVideo(req.user?.id, latestStatus);
        video = latestStatus;
      }

      if (!video) {
        return res.status(404).json({
          error: 'Video not found',
        });
      }

      res.json({
        success: true,
        data: video,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List user's videos
   * GET /api/videos
   */
  async listVideos(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const videos = await videoService.getUserVideos(userId, limit, offset);

      res.json({
        success: true,
        data: videos,
        pagination: {
          limit,
          offset,
          hasMore: videos.length === limit,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete video
   * DELETE /api/videos/:videoId
   */
  async deleteVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params;

      // Delete from Sora
      await soraService.deleteVideo(videoId);

      // Delete from database
      await pool.query('DELETE FROM videos WHERE id = $1', [videoId]);

      res.json({
        success: true,
        message: 'Video deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Download video content
   * GET /api/videos/:videoId/download
   */
  async downloadVideo(req: Request, res: Response, next: NextFunction) {
    try {
      const { videoId } = req.params;

      // Check if video is completed
      const video = await videoService.getVideo(videoId);
      if (!video || video.status !== 'completed') {
        return res.status(400).json({
          error: 'Video is not ready for download',
        });
      }

      // Download from Sora
      const videoBuffer = await soraService.downloadVideoContent(videoId);

      // Set headers
      res.setHeader('Content-Type', 'video/mp4');
      res.setHeader('Content-Disposition', `attachment; filename="video_${videoId}.mp4"`);
      res.setHeader('Content-Length', videoBuffer.length);

      // Send video
      res.send(videoBuffer);
    } catch (error) {
      next(error);
    }
  }
}

export default new VideoController();
```

### Step 9: Routes

**`src/routes/video.routes.ts`**
```typescript
import { Router } from 'express';
import videoController from '../controllers/video.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateVideo } from '../middleware/validation.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Create video
router.post('/', validateVideo.create, videoController.createVideo);

// Remix video
router.post('/:videoId/remix', validateVideo.remix, videoController.remixVideo);

// Get video status
router.get('/:videoId', videoController.getVideo);

// List videos
router.get('/', videoController.listVideos);

// Delete video
router.delete('/:videoId', videoController.deleteVideo);

// Download video
router.get('/:videoId/download', videoController.downloadVideo);

export default router;
```

### Step 10: Middleware

**`src/middleware/validation.middleware.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';

export const validateVideo = {
  create: (req: Request, res: Response, next: NextFunction) => {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Prompt is required and must be a string',
      });
    }

    if (prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'Prompt cannot be empty',
      });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({
        error: 'Prompt must be less than 1000 characters',
      });
    }

    next();
  },

  remix: (req: Request, res: Response, next: NextFunction) => {
    const { prompt } = req.body;
    const { videoId } = req.params;

    if (!videoId) {
      return res.status(400).json({
        error: 'Video ID is required',
      });
    }

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({
        error: 'Remix prompt is required and must be a string',
      });
    }

    next();
  },
};
```

**`src/middleware/error.middleware.ts`**
```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

### Step 11: Background Worker (Status Polling)

**`src/workers/status-poller.worker.ts`**
```typescript
import pool from '../config/database';
import soraService from '../services/sora.service';
import videoService from '../services/video.service';

class StatusPollerWorker {
  private isRunning = false;
  private pollInterval = 30000; // 30 seconds

  async start() {
    if (this.isRunning) {
      console.log('Status poller is already running');
      return;
    }

    this.isRunning = true;
    console.log('✅ Status poller worker started');

    while (this.isRunning) {
      try {
        await this.pollPendingVideos();
      } catch (error) {
        console.error('Polling error:', error);
      }

      await this.sleep(this.pollInterval);
    }
  }

  stop() {
    this.isRunning = false;
    console.log('❌ Status poller worker stopped');
  }

  private async pollPendingVideos() {
    // Get all pending videos
    const query = `
      SELECT id FROM videos 
      WHERE status IN ('queued', 'in_progress')
      ORDER BY created_at DESC
      LIMIT 50
    `;

    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return;
    }

    console.log(`Polling ${result.rows.length} pending videos`);

    // Poll each video
    const promises = result.rows.map(row => this.pollVideo(row.id));
    await Promise.allSettled(promises);
  }

  private async pollVideo(videoId: string) {
    try {
      // Get latest status from Sora
      const videoJob = await soraService.getVideoStatus(videoId);

      // Update database
      await videoService.updateVideoStatus(videoId, videoJob.status, videoJob.progress);

      // If completed, download and store video
      if (videoJob.status === 'completed') {
        console.log(`✅ Video ${videoId} completed`);
        await videoService.logEvent(videoId, 'video.completed', videoJob);

        // Optionally trigger download worker here
        // await this.triggerDownload(videoId);
      }

      // If failed, log error
      if (videoJob.status === 'failed') {
        console.error(`❌ Video ${videoId} failed:`, videoJob.error);
        await videoService.logEvent(videoId, 'video.failed', videoJob);
      }
    } catch (error) {
      console.error(`Error polling video ${videoId}:`, error);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new StatusPollerWorker();
```

### Step 12: Main Application

**`src/app.ts`**
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import videoRoutes from './routes/video.routes';
import { errorHandler } from './middleware/error.middleware';
import statusPollerWorker from './workers/status-poller.worker';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/videos', videoRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  
  // Start background workers
  statusPollerWorker.start();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  statusPollerWorker.stop();
  process.exit(0);
});

export default app;
```

---

## Frontend Implementation

### Step 1: Next.js Setup

```bash
# Create Next.js app with TypeScript
npx create-next-app@latest sora-video-frontend --typescript --tailwind --app

cd sora-video-frontend

# Install additional dependencies
npm install axios swr react-query
npm install @tanstack/react-query
npm install lucide-react
```

### Step 2: API Client

**`lib/api/client.ts`**
```typescript
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

**`lib/api/videos.ts`**
```typescript
import apiClient from './client';
import { VideoJob, CreateVideoRequest, RemixVideoRequest } from '@/types';

export const videoApi = {
  create: async (data: CreateVideoRequest): Promise<VideoJob> => {
    const response = await apiClient.post('/videos', data);
    return response.data.data;
  },

  remix: async (videoId: string, data: RemixVideoRequest): Promise<VideoJob> => {
    const response = await apiClient.post(`/videos/${videoId}/remix`, data);
    return response.data.data;
  },

  getVideo: async (videoId: string): Promise<VideoJob> => {
    const response = await apiClient.get(`/videos/${videoId}`);
    return response.data.data;
  },

  listVideos: async (limit: number = 20, offset: number = 0): Promise<VideoJob[]> => {
    const response = await apiClient.get(`/videos?limit=${limit}&offset=${offset}`);
    return response.data.data;
  },

  deleteVideo: async (videoId: string): Promise<void> => {
    await apiClient.delete(`/videos/${videoId}`);
  },

  getDownloadUrl: (videoId: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    return `${baseUrl}/videos/${videoId}/download`;
  },
};
```

### Step 3: Video Creation Component

**`components/VideoCreator.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { videoApi } from '@/lib/api/videos';
import { Loader2, Sparkles } from 'lucide-react';

export default function VideoCreator({ onVideoCreated }: { onVideoCreated?: (videoId: string) => void }) {
  const [prompt, setPrompt] = useState('');

  const createVideoMutation = useMutation({
    mutationFn: (prompt: string) => videoApi.create({ prompt }),
    onSuccess: (data) => {
      setPrompt('');
      onVideoCreated?.(data.id);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      createVideoMutation.mutate(prompt);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Sparkles className="text-purple-600" />
          Create Video with Sora 2
        </h2>
        <p className="text-gray-600 mt-2">
          Describe the video you want to generate in detail
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            Video Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="A serene lake at sunset with mountains in the background, birds flying across the sky..."
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent resize-none"
            maxLength={1000}
            disabled={createVideoMutation.isPending}
          />
          <div className="mt-2 text-sm text-gray-500 text-right">
            {prompt.length}/1000 characters
          </div>
        </div>

        {createVideoMutation.isError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              {(createVideoMutation.error as any)?.response?.data?.error || 
               'Failed to create video. Please try again.'}
            </p>
          </div>
        )}

        {createVideoMutation.isSuccess && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Video generation started! Check the status below.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!prompt.trim() || createVideoMutation.isPending}
          className="w-full py-3 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {createVideoMutation.isPending ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Generating Video...
            </>
          ) : (
            <>
              <Sparkles size={20} />
              Generate Video
            </>
          )}
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Prompt Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Be specific about the scene, setting, and actions</li>
          <li>Include details about lighting, camera angles, and mood</li>
          <li>Mention specific colors, textures, and movements</li>
          <li>Keep it under 1000 characters for best results</li>
        </ul>
      </div>
    </div>
  );
}
```

### Step 4: Video Status Component

**`components/VideoStatus.tsx`**
```typescript
'use client';

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { videoApi } from '@/lib/api/videos';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function VideoStatus({ videoId }: { videoId: string }) {
  const { data: video, refetch } = useQuery({
    queryKey: ['video', videoId],
    queryFn: () => videoApi.getVideo(videoId),
    refetchInterval: (data) => {
      // Stop polling if completed or failed
      if (data?.status === 'completed' || data?.status === 'failed') {
        return false;
      }
      return 5000; // Poll every 5 seconds
    },
  });

  if (!video) {
    return <div>Loading...</div>;
  }

  const getStatusIcon = () => {
    switch (video.status) {
      case 'queued':
        return <Clock className="text-yellow-600" size={24} />;
      case 'in_progress':
        return <Loader2 className="text-blue-600 animate-spin" size={24} />;
      case 'completed':
        return <CheckCircle className="text-green-600" size={24} />;
      case 'failed':
        return <XCircle className="text-red-600" size={24} />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (video.status) {
      case 'queued':
        return 'Queued';
      case 'in_progress':
        return 'Generating...';
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center gap-4 mb-6">
        {getStatusIcon()}
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{getStatusText()}</h3>
          <p className="text-sm text-gray-600">Video ID: {video.id}</p>
        </div>
      </div>

      {(video.status === 'in_progress' || video.status === 'queued') && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${video.progress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600 mt-2 text-center">
            {video.progress}% complete
          </p>
        </div>
      )}

      {video.prompt && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Prompt:</h4>
          <p className="text-sm text-gray-600">{video.prompt}</p>
        </div>
      )}

      {video.status === 'completed' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Duration</p>
              <p className="font-semibold text-gray-900">{video.seconds}s</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Resolution</p>
              <p className="font-semibold text-gray-900">{video.size}</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-600">Quality</p>
              <p className="font-semibold text-gray-900">{video.quality}</p>
            </div>
          </div>

          <a
            href={videoApi.getDownloadUrl(video.id)}
            download
            className="block w-full py-3 px-6 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-center transition-colors"
          >
            Download Video
          </a>
        </div>
      )}

      {video.status === 'failed' && video.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{video.error.message}</p>
        </div>
      )}
    </div>
  );
}
```

### Step 5: Video List Component

**`components/VideoList.tsx`**
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { videoApi } from '@/lib/api/videos';
import { Film, Clock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function VideoList() {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['videos'],
    queryFn: () => videoApi.listVideos(),
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading videos...</div>;
  }

  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12">
        <Film className="mx-auto text-gray-400 mb-4" size={48} />
        <p className="text-gray-600">No videos yet. Create your first video!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {videos.map((video) => (
        <Link
          key={video.id}
          href={`/videos/${video.id}`}
          className="block bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
        >
          <div className="aspect-video bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
            <Film className="text-white" size={48} />
          </div>
          
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-500 uppercase">
                {video.status === 'completed' && <CheckCircle className="inline mr-1" size={16} />}
                {video.status === 'in_progress' && <Clock className="inline mr-1" size={16} />}
                {video.status === 'failed' && <XCircle className="inline mr-1" size={16} />}
                {video.status}
              </span>
              {video.seconds && (
                <span className="text-xs text-gray-500">{video.seconds}s</span>
              )}
            </div>
            
            <p className="text-sm text-gray-700 line-clamp-2">
              {video.prompt || 'No prompt available'}
            </p>
            
            <div className="mt-3 text-xs text-gray-500">
              {new Date(video.created_at * 1000).toLocaleDateString()}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
```

### Step 6: Main Page

**`app/page.tsx`**
```typescript
'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import VideoCreator from '@/components/VideoCreator';
import VideoStatus from '@/components/VideoStatus';
import VideoList from '@/components/VideoList';

const queryClient = new QueryClient();

export default function Home() {
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);

  return (
    <QueryClientProvider client={queryClient}>
      <main className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12 px-4">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sora 2 Video Generator
            </h1>
            <p className="text-xl text-gray-600">
              Create stunning AI-generated videos from text descriptions
            </p>
          </div>

          <VideoCreator onVideoCreated={setCurrentVideoId} />

          {currentVideoId && (
            <VideoStatus videoId={currentVideoId} />
          )}

          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Videos
            </h2>
            <VideoList />
          </div>
        </div>
      </main>
    </QueryClientProvider>
  );
}
```

---

## Advanced Features

### Webhook Integration

**`src/controllers/webhook.controller.ts`**
```typescript
import { Request, Response } from 'express';
import crypto from 'crypto';
import videoService from '../services/video.service';

export class WebhookController {
  /**
   * Handle Sora webhooks
   * POST /webhooks/sora
   */
  async handleWebhook(req: Request, res: Response) {
    try {
      // Verify webhook signature
      const signature = req.headers['x-openai-signature'] as string;
      if (!this.verifySignature(req.body, signature)) {
        return res.status(401).json({ error: 'Invalid signature' });
      }

      const event = req.body;

      // Process based on event type
      switch (event.type) {
        case 'video.completed':
          await this.handleVideoCompleted(event.data);
          break;
        case 'video.failed':
          await this.handleVideoFailed(event.data);
          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error) {
      console.error('Webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  private verifySignature(payload: any, signature: string): boolean {
    const secret = process.env.WEBHOOK_SECRET;
    if (!secret) return true; // Skip verification if no secret configured

    const hmac = crypto.createHmac('sha256', secret);
    const digest = hmac.update(JSON.stringify(payload)).digest('hex');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(digest)
    );
  }

  private async handleVideoCompleted(video: any) {
    await videoService.updateVideoStatus(video.id, 'completed', 100);
    await videoService.logEvent(video.id, 'webhook.video.completed', video);
    
    // Trigger any post-completion actions
    // - Send notification
    // - Download and archive video
    // - Generate thumbnail
  }

  private async handleVideoFailed(video: any) {
    await videoService.updateVideoStatus(video.id, 'failed', 0);
    await videoService.logEvent(video.id, 'webhook.video.failed', video);
    
    // Trigger failure actions
    // - Send error notification
    // - Log for analysis
  }
}

export default new WebhookController();
```

### Real-time Updates with WebSocket

**`src/services/websocket.service.ts`**
```typescript
import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import redis from '../config/redis';

class WebSocketService {
  private io: Server | null = null;

  initialize(httpServer: HttpServer) {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL,
        credentials: true,
      },
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('subscribe:video', (videoId: string) => {
        socket.join(`video:${videoId}`);
        console.log(`Client ${socket.id} subscribed to video ${videoId}`);
      });

      socket.on('unsubscribe:video', (videoId: string) => {
        socket.leave(`video:${videoId}`);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    // Subscribe to Redis for video updates
    const subscriber = redis.duplicate();
    subscriber.subscribe('video:updates');

    subscriber.on('message', (channel, message) => {
      const update = JSON.parse(message);
      this.io?.to(`video:${update.videoId}`).emit('video:update', update);
    });
  }

  notifyVideoUpdate(videoId: string, data: any) {
    // Publish to Redis for distribution across instances
    redis.publish('video:updates', JSON.stringify({
      videoId,
      ...data,
    }));
  }
}

export default new WebSocketService();
```

### Video Thumbnail Generation

**`src/services/thumbnail.service.ts`**
```typescript
import ffmpeg from 'fluent-ffmpeg';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

class ThumbnailService {
  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async generateThumbnail(videoPath: string, videoId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const thumbnailPath = `/tmp/thumb_${videoId}.jpg`;

      ffmpeg(videoPath)
        .screenshots({
          timestamps: ['00:00:01'],
          filename: `thumb_${videoId}.jpg`,
          folder: '/tmp',
          size: '640x360',
        })
        .on('end', async () => {
          try {
            const thumbnailUrl = await this.uploadToS3(thumbnailPath, videoId);
            resolve(thumbnailUrl);
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  private async uploadToS3(filePath: string, videoId: string): Promise<string> {
    const fs = require('fs');
    const fileContent = fs.readFileSync(filePath);

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: `thumbnails/${videoId}.jpg`,
      Body: fileContent,
      ContentType: 'image/jpeg',
    });

    await this.s3Client.send(command);

    return `https://${process.env.S3_BUCKET}.s3.${process.env.S3_REGION}.amazonaws.com/thumbnails/${videoId}.jpg`;
  }
}

export default new ThumbnailService();
```

---

## Best Practices & Optimization

### 1. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

// Rate limiter for video creation
export const videoCreationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each user to 10 requests per windowMs
  message: 'Too many video creation requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
```

### 2. Caching Strategy

```typescript
// Cache video metadata
async function getCachedVideo(videoId: string) {
  const cached = await redis.get(`video:${videoId}`);
  if (cached) {
    return JSON.parse(cached);
  }

  const video = await fetchFromDatabase(videoId);
  await redis.setex(`video:${videoId}`, 3600, JSON.stringify(video));
  
  return video;
}
```

### 3. Error Handling & Retry Logic

```typescript
async function retryableOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}
```

### 4. Database Indexing

```sql
-- Essential indexes for performance
CREATE INDEX idx_videos_user_status ON videos(user_id, status);
CREATE INDEX idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX idx_video_events_video_id ON video_events(video_id);
```

### 5. Connection Pooling

```typescript
// Optimize database connections
const pool = new Pool({
  max: 20,                    // Maximum pool size
  min: 5,                     // Minimum pool size
  idleTimeoutMillis: 30000,   // Close idle clients
  connectionTimeoutMillis: 2000,
});
```

---

## Security & Cost Management

### Security Best Practices

1. **API Key Protection**
```typescript
// Never expose API keys in frontend
// Always use server-side proxy
const apiKey = process.env.OPENAI_API_KEY; // Server-side only
```

2. **Input Validation**
```typescript
// Sanitize user input
import validator from 'validator';

function validatePrompt(prompt: string): string {
  // Remove potentially harmful characters
  let sanitized = validator.escape(prompt);
  
  // Limit length
  if (sanitized.length > 1000) {
    sanitized = sanitized.substring(0, 1000);
  }
  
  return sanitized;
}
```

3. **Authentication & Authorization**
```typescript
// Implement JWT-based auth
import jwt from 'jsonwebtoken';

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Cost Management

**`src/services/cost-tracker.service.ts`**
```typescript
class CostTrackerService {
  async trackVideoGeneration(userId: string, videoParams: any) {
    // Estimate cost based on video parameters
    const estimatedCost = this.calculateCost(videoParams);
    
    await pool.query(`
      INSERT INTO usage_tracking (user_id, operation, cost, metadata)
      VALUES ($1, $2, $3, $4)
    `, [userId, 'video_generation', estimatedCost, JSON.stringify(videoParams)]);
  }

  private calculateCost(params: any): number {
    // Sora 2 pricing (example - adjust to actual pricing)
    const baseCost = 0.50; // Base cost per video
    const qualityMultiplier = params.quality === 'high' ? 2 : 1;
    const durationMultiplier = parseInt(params.seconds || '5') / 5;
    
    return baseCost * qualityMultiplier * durationMultiplier;
  }

  async getUserMonthlySpend(userId: string): Promise<number> {
    const result = await pool.query(`
      SELECT SUM(cost) as total
      FROM usage_tracking
      WHERE user_id = $1
        AND created_at >= date_trunc('month', CURRENT_DATE)
    `, [userId]);

    return parseFloat(result.rows[0]?.total || '0');
  }
}

export default new CostTrackerService();
```

---

## Testing & Monitoring

### Unit Tests

**`tests/unit/sora.service.test.ts`**
```typescript
import { describe, it, expect, jest } from '@jest/globals';
import soraService from '../../src/services/sora.service';

describe('SoraService', () => {
  it('should create video with valid prompt', async () => {
    const result = await soraService.createVideo({
      prompt: 'A cat playing piano',
    });

    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('status');
    expect(result.model).toBe('sora-2');
  });

  it('should throw error with invalid prompt', async () => {
    await expect(
      soraService.createVideo({ prompt: '' })
    ).rejects.toThrow();
  });
});
```

### Integration Tests

**`tests/integration/video.api.test.ts`**
```typescript
import request from 'supertest';
import app from '../../src/app';

describe('Video API', () => {
  it('POST /api/videos - should create video', async () => {
    const response = await request(app)
      .post('/api/videos')
      .set('Authorization', 'Bearer test-token')
      .send({ prompt: 'Test video' })
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
  });

  it('GET /api/videos/:id - should get video status', async () => {
    const response = await request(app)
      .get('/api/videos/video_123')
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    expect(response.body.data).toHaveProperty('status');
  });
});
```

### Monitoring Setup

**`src/utils/logger.ts`**
```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export default logger;
```

### Health Checks & Metrics

```typescript
import { Router } from 'express';

const healthRouter = Router();

healthRouter.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      openai: await checkOpenAI(),
    },
  };

  const isHealthy = Object.values(health.checks).every(check => check.status === 'ok');
  res.status(isHealthy ? 200 : 503).json(health);
});

async function checkDatabase() {
  try {
    await pool.query('SELECT 1');
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

async function checkRedis() {
  try {
    await redis.ping();
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

async function checkOpenAI() {
  try {
    await openai.models.list();
    return { status: 'ok' };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}

export default healthRouter;
```

---

## Deployment Guide

### Docker Setup

**`Dockerfile`**
```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

EXPOSE 3000

CMD ["node", "dist/app.js"]
```

**`docker-compose.yml`**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data

  postgres:
    image: postgres:14-alpine
    environment:
      - POSTGRES_DB=sora_videos
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - postgres-data:/var/lib/postgresql/data

  worker:
    build: .
    command: node dist/workers/status-poller.worker.js
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=redis://redis:6379
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    depends_on:
      - redis
      - postgres

volumes:
  redis-data:
  postgres-data:
```

### CI/CD Pipeline (GitHub Actions)

**`.github/workflows/deploy.yml`**
```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Login to Docker Hub
        uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKER_USERNAME }}
          password: ${{ secrets.DOCKER_PASSWORD }}
      
      - name: Build and push
        uses: docker/build-push-action@v4
        with:
          push: true
          tags: your-repo/sora-backend:latest
      
      - name: Deploy to production
        run: |
          # Add your deployment commands here
          # e.g., kubectl apply, AWS ECS update, etc.
```

### Environment-Specific Configuration

**`config/production.ts`**
```typescript
export default {
  port: process.env.PORT || 3000,
  database: {
    url: process.env.DATABASE_URL,
    ssl: true,
    pool: {
      min: 5,
      max: 20,
    },
  },
  redis: {
    url: process.env.REDIS_URL,
    tls: process.env.REDIS_TLS === 'true',
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    timeout: 60000,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
  },
};
```

---

## Quick Start Checklist

### Backend Setup
- [ ] Clone repository
- [ ] Install dependencies (`npm install`)
- [ ] Set up environment variables
- [ ] Run database migrations
- [ ] Start Redis server
- [ ] Start development server (`npm run dev`)
- [ ] Test API endpoints

### Frontend Setup
- [ ] Install dependencies
- [ ] Configure API endpoint
- [ ] Start development server
- [ ] Test video creation flow

### Production Deployment
- [ ] Set up production database (NeonDB)
- [ ] Configure Redis instance
- [ ] Set up environment variables
- [ ] Build Docker images
- [ ] Deploy containers
- [ ] Configure monitoring
- [ ] Set up logging
- [ ] Enable webhooks
- [ ] Test end-to-end flow

---

## Common Issues & Troubleshooting

### Issue 1: API Key Errors
**Symptom:** `401 Unauthorized` errors
**Solution:** Verify OPENAI_API_KEY is set correctly and has Sora 2 access

### Issue 2: Database Connection Timeouts
**Symptom:** Connection pool exhausted
**Solution:** Increase pool size or optimize queries

### Issue 3: Video Status Not Updating
**Symptom:** Status stuck at "queued"
**Solution:** Check status poller worker is running

### Issue 4: Download Failures
**Symptom:** Cannot download completed videos
**Solution:** Verify video has `completed` status and not expired

---

## Conclusion

This guide provides a complete, production-ready implementation for integrating OpenAI's Sora 2 video generation into your application. The architecture is scalable, secure, and follows industry best practices.

**Next Steps:**
1. Customize the implementation for your specific use case
2. Add additional features (thumbnails, editing, sharing)
3. Implement analytics and monitoring
4. Optimize for scale
5. Consider multi-tenancy if needed

**Resources:**
- [OpenAI Sora 2 Documentation](https://platform.openai.com/docs/api-reference/videos)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Express.js Documentation](https://expressjs.com/)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Version:** 1.0.0  
**Last Updated:** October 2025  
**Author:** AI Solutions Architect Team
