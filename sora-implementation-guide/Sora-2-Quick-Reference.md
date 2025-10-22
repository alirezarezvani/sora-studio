# Sora 2 Quick Reference & Code Snippets

## Table of Contents
1. [Immediate Start Examples](#immediate-start-examples)
2. [API Endpoint Reference](#api-endpoint-reference)
3. [Ready-to-Use Code Snippets](#ready-to-use-code-snippets)
4. [Common Use Cases](#common-use-cases)
5. [Error Handling Examples](#error-handling-examples)

---

## Immediate Start Examples

### Basic Video Creation (Node.js)

```javascript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create a video
async function createVideo() {
  const video = await openai.videos.create({
    model: 'sora-2',
    prompt: 'A serene lake at sunset with mountains in the background',
  });
  
  console.log('Video ID:', video.id);
  console.log('Status:', video.status);
  return video;
}

createVideo();
```

### Check Video Status

```javascript
async function checkStatus(videoId) {
  const video = await openai.videos.retrieve(videoId);
  
  console.log(`Status: ${video.status}`);
  console.log(`Progress: ${video.progress}%`);
  
  return video;
}

// Poll until complete
async function waitForCompletion(videoId) {
  while (true) {
    const video = await checkStatus(videoId);
    
    if (video.status === 'completed') {
      console.log('✅ Video is ready!');
      return video;
    }
    
    if (video.status === 'failed') {
      throw new Error('Video generation failed');
    }
    
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
  }
}
```

### Download Video

```javascript
async function downloadVideo(videoId, filename = 'output.mp4') {
  const fs = require('fs');
  
  // Get video content
  const response = await openai.videos.downloadContent(videoId);
  const blob = await response.blob();
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Save to file
  fs.writeFileSync(filename, buffer);
  console.log(`✅ Video saved to ${filename}`);
}
```

### Complete Workflow Example

```javascript
async function generateAndDownload() {
  try {
    // 1. Create video
    console.log('Creating video...');
    const video = await openai.videos.create({
      model: 'sora-2',
      prompt: 'A cat wearing sunglasses riding a skateboard in a park',
    });
    
    console.log(`Video created: ${video.id}`);
    
    // 2. Wait for completion
    console.log('Waiting for video generation...');
    const completed = await waitForCompletion(video.id);
    
    // 3. Download video
    console.log('Downloading video...');
    await downloadVideo(video.id, `video_${video.id}.mp4`);
    
    console.log('✅ Done!');
    return completed;
  } catch (error) {
    console.error('❌ Error:', error.message);
    throw error;
  }
}

generateAndDownload();
```

---

## API Endpoint Reference

### Create Video

```bash
curl https://api.openai.com/v1/videos \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -F "model=sora-2" \
  -F "prompt=A calico cat playing a piano on stage"
```

**Response:**
```json
{
  "id": "video_123",
  "object": "video",
  "model": "sora-2",
  "status": "queued",
  "progress": 0,
  "created_at": 1712697600,
  "size": "1024x1808",
  "seconds": "8",
  "quality": "standard"
}
```

### Remix Video

```bash
curl -X POST https://api.openai.com/v1/videos/video_123/remix \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Extend the scene with the cat taking a bow"
  }'
```

### List Videos

```bash
curl https://api.openai.com/v1/videos?limit=20&order=desc \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Get Video Status

```bash
curl https://api.openai.com/v1/videos/video_123 \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Delete Video

```bash
curl -X DELETE https://api.openai.com/v1/videos/video_123 \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

### Download Video

```bash
curl https://api.openai.com/v1/videos/video_123/content \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  --output video.mp4
```

---

## Ready-to-Use Code Snippets

### Express.js Route Handler

```javascript
import express from 'express';
import OpenAI from 'openai';

const router = express.Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Create video endpoint
router.post('/videos', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    const video = await openai.videos.create({
      model: 'sora-2',
      prompt,
    });
    
    res.status(201).json({ success: true, video });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get video status
router.get('/videos/:id', async (req, res) => {
  try {
    const video = await openai.videos.retrieve(req.params.id);
    res.json({ success: true, video });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
```

### React Component

```jsx
import { useState } from 'react';
import axios from 'axios';

function VideoGenerator() {
  const [prompt, setPrompt] = useState('');
  const [videoId, setVideoId] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const createVideo = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/videos', { prompt });
      setVideoId(response.data.video.id);
      pollStatus(response.data.video.id);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const pollStatus = async (id) => {
    const interval = setInterval(async () => {
      try {
        const response = await axios.get(`/api/videos/${id}`);
        setStatus(response.data.video.status);
        
        if (response.data.video.status === 'completed' || 
            response.data.video.status === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error:', error);
        clearInterval(interval);
      }
    }, 5000);
  };

  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your video..."
      />
      
      <button onClick={createVideo} disabled={loading || !prompt}>
        {loading ? 'Creating...' : 'Generate Video'}
      </button>
      
      {videoId && (
        <div>
          <p>Video ID: {videoId}</p>
          <p>Status: {status}</p>
          
          {status === 'completed' && (
            <a href={`/api/videos/${videoId}/download`} download>
              Download Video
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default VideoGenerator;
```

### Next.js API Route

```typescript
// app/api/videos/route.ts
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    
    const video = await openai.videos.create({
      model: 'sora-2',
      prompt,
    });
    
    return NextResponse.json({ success: true, video });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const videos = await openai.videos.list({ limit: 20 });
    return NextResponse.json({ success: true, videos: videos.data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

### Python Implementation

```python
from openai import OpenAI
import time

client = OpenAI(api_key="your-api-key")

def create_video(prompt):
    """Create a video with Sora 2"""
    video = client.videos.create(
        model="sora-2",
        prompt=prompt
    )
    
    print(f"Video created: {video.id}")
    return video

def wait_for_completion(video_id, timeout=300):
    """Poll until video is complete"""
    start_time = time.time()
    
    while time.time() - start_time < timeout:
        video = client.videos.retrieve(video_id)
        
        print(f"Status: {video.status}, Progress: {video.progress}%")
        
        if video.status == "completed":
            print("✅ Video is ready!")
            return video
        
        if video.status == "failed":
            raise Exception("Video generation failed")
        
        time.sleep(5)
    
    raise TimeoutError("Video generation timed out")

def download_video(video_id, filename="output.mp4"):
    """Download completed video"""
    response = client.videos.download_content(video_id)
    
    with open(filename, "wb") as f:
        f.write(response.read())
    
    print(f"✅ Video saved to {filename}")

# Complete workflow
def generate_video(prompt):
    # Create video
    video = create_video(prompt)
    
    # Wait for completion
    completed = wait_for_completion(video.id)
    
    # Download
    download_video(video.id, f"video_{video.id}.mp4")
    
    return completed

# Example usage
generate_video("A beautiful sunset over the ocean with dolphins jumping")
```

### TypeScript Utility Class

```typescript
import OpenAI from 'openai';

interface VideoOptions {
  prompt: string;
  model?: string;
  size?: string;
  seconds?: string;
  quality?: string;
}

class SoraVideoClient {
  private client: OpenAI;

  constructor(apiKey: string) {
    this.client = new OpenAI({ apiKey });
  }

  async createVideo(options: VideoOptions) {
    return await this.client.videos.create({
      model: options.model || 'sora-2',
      prompt: options.prompt,
      ...(options.size && { size: options.size }),
      ...(options.seconds && { seconds: options.seconds }),
      ...(options.quality && { quality: options.quality }),
    });
  }

  async getStatus(videoId: string) {
    return await this.client.videos.retrieve(videoId);
  }

  async waitForCompletion(
    videoId: string,
    onProgress?: (progress: number) => void,
    timeout: number = 300000 // 5 minutes
  ) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const video = await this.getStatus(videoId);

      if (onProgress) {
        onProgress(video.progress);
      }

      if (video.status === 'completed') {
        return video;
      }

      if (video.status === 'failed') {
        throw new Error(video.error?.message || 'Video generation failed');
      }

      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    throw new Error('Timeout waiting for video completion');
  }

  async downloadVideo(videoId: string): Promise<Buffer> {
    const response = await this.client.videos.downloadContent(videoId);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async remixVideo(videoId: string, prompt: string) {
    return await this.client.videos.remix(videoId, { prompt });
  }

  async listVideos(limit: number = 20, after?: string) {
    return await this.client.videos.list({ limit, ...(after && { after }) });
  }

  async deleteVideo(videoId: string) {
    return await this.client.videos.delete(videoId);
  }
}

// Usage example
async function example() {
  const client = new SoraVideoClient(process.env.OPENAI_API_KEY!);

  // Create video
  const video = await client.createVideo({
    prompt: 'A futuristic city at night with flying cars',
  });

  console.log('Video created:', video.id);

  // Wait for completion with progress updates
  const completed = await client.waitForCompletion(
    video.id,
    (progress) => console.log(`Progress: ${progress}%`)
  );

  console.log('Video completed!');

  // Download video
  const buffer = await client.downloadVideo(video.id);
  require('fs').writeFileSync('output.mp4', buffer);

  console.log('Video downloaded!');
}

export default SoraVideoClient;
```

---

## Common Use Cases

### Use Case 1: Batch Video Generation

```javascript
async function generateBatch(prompts) {
  const videoIds = [];

  // Create all videos
  for (const prompt of prompts) {
    const video = await openai.videos.create({
      model: 'sora-2',
      prompt,
    });
    videoIds.push(video.id);
    console.log(`Created: ${video.id}`);
  }

  // Wait for all to complete
  const completedVideos = await Promise.all(
    videoIds.map((id) => waitForCompletion(id))
  );

  // Download all
  await Promise.all(
    completedVideos.map((video, index) =>
      downloadVideo(video.id, `batch_${index}.mp4`)
    )
  );

  console.log('✅ All videos generated and downloaded');
  return completedVideos;
}

// Usage
const prompts = [
  'A sunrise over mountains',
  'Ocean waves crashing on beach',
  'City traffic at rush hour',
];

generateBatch(prompts);
```

### Use Case 2: Video Remix Chain

```javascript
async function createRemixChain(initialPrompt, remixes) {
  // Create initial video
  let video = await openai.videos.create({
    model: 'sora-2',
    prompt: initialPrompt,
  });

  await waitForCompletion(video.id);
  console.log('Initial video created:', video.id);

  // Chain remixes
  for (const remixPrompt of remixes) {
    video = await openai.videos.remix(video.id, {
      prompt: remixPrompt,
    });

    await waitForCompletion(video.id);
    console.log('Remix created:', video.id);
  }

  // Download final video
  await downloadVideo(video.id, 'final_remix.mp4');

  return video;
}

// Usage
createRemixChain(
  'A cat sitting on a windowsill',
  [
    'The cat starts to yawn',
    'The cat stands up and stretches',
    'The cat jumps down from the windowsill',
  ]
);
```

### Use Case 3: Video Gallery with Metadata

```javascript
import fs from 'fs';
import path from 'path';

async function createVideoGallery(prompts) {
  const gallery = [];

  for (const prompt of prompts) {
    // Create video
    const video = await openai.videos.create({
      model: 'sora-2',
      prompt,
    });

    // Wait for completion
    const completed = await waitForCompletion(video.id);

    // Download video
    const filename = `video_${video.id}.mp4`;
    await downloadVideo(video.id, filename);

    // Save metadata
    gallery.push({
      id: video.id,
      prompt,
      filename,
      size: completed.size,
      seconds: completed.seconds,
      quality: completed.quality,
      created_at: new Date(completed.created_at * 1000),
    });
  }

  // Save gallery metadata
  fs.writeFileSync(
    'gallery.json',
    JSON.stringify(gallery, null, 2)
  );

  console.log(`✅ Gallery created with ${gallery.length} videos`);
  return gallery;
}
```

### Use Case 4: Webhook Handler

```javascript
import express from 'express';
import crypto from 'crypto';

const app = express();
app.use(express.json());

// Webhook handler
app.post('/webhooks/sora', (req, res) => {
  // Verify signature
  const signature = req.headers['x-openai-signature'];
  const body = JSON.stringify(req.body);
  const secret = process.env.WEBHOOK_SECRET;

  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(body).digest('hex');

  if (signature !== digest) {
    return res.status(401).json({ error: 'Invalid signature' });
  }

  // Process event
  const event = req.body;

  switch (event.type) {
    case 'video.completed':
      handleVideoCompleted(event.data);
      break;
    case 'video.failed':
      handleVideoFailed(event.data);
      break;
    default:
      console.log(`Unknown event type: ${event.type}`);
  }

  res.json({ received: true });
});

async function handleVideoCompleted(video) {
  console.log(`✅ Video ${video.id} completed`);

  // Auto-download completed videos
  await downloadVideo(video.id, `auto_${video.id}.mp4`);

  // Send notification
  // await sendEmail(`Video ${video.id} is ready`);
}

function handleVideoFailed(video) {
  console.error(`❌ Video ${video.id} failed:`, video.error);

  // Send error notification
  // await sendErrorAlert(video);
}

app.listen(3000);
```

---

## Error Handling Examples

### Retry Logic

```javascript
async function retryOperation(operation, maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      console.log(`Attempt ${i + 1} failed:`, error.message);

      if (i === maxRetries - 1) {
        throw error;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, delay * (i + 1))
      );
    }
  }
}

// Usage
const video = await retryOperation(() =>
  openai.videos.create({
    model: 'sora-2',
    prompt: 'A beautiful landscape',
  })
);
```

### Graceful Error Handling

```javascript
async function safeCreateVideo(prompt) {
  try {
    // Validate prompt
    if (!prompt || prompt.trim().length === 0) {
      throw new Error('Prompt cannot be empty');
    }

    if (prompt.length > 1000) {
      throw new Error('Prompt too long (max 1000 characters)');
    }

    // Create video
    const video = await openai.videos.create({
      model: 'sora-2',
      prompt,
    });

    return { success: true, video };
  } catch (error) {
    console.error('Error creating video:', error);

    return {
      success: false,
      error: {
        message: error.message,
        code: error.code || 'UNKNOWN_ERROR',
      },
    };
  }
}

// Usage
const result = await safeCreateVideo('A sunset');

if (result.success) {
  console.log('Video created:', result.video.id);
} else {
  console.error('Failed:', result.error.message);
}
```

### Timeout Handling

```javascript
async function createWithTimeout(prompt, timeoutMs = 60000) {
  return Promise.race([
    openai.videos.create({ model: 'sora-2', prompt }),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    ),
  ]);
}

// Usage
try {
  const video = await createWithTimeout('A peaceful garden', 30000);
  console.log('Video created:', video.id);
} catch (error) {
  if (error.message === 'Request timeout') {
    console.error('Request took too long');
  } else {
    console.error('Error:', error.message);
  }
}
```

### Rate Limit Handling

```javascript
class RateLimitedClient {
  constructor(apiKey) {
    this.client = new OpenAI({ apiKey });
    this.requestQueue = [];
    this.processing = false;
    this.requestsPerMinute = 10;
    this.minDelay = 60000 / this.requestsPerMinute; // 6 seconds
  }

  async createVideo(prompt) {
    return new Promise((resolve, reject) => {
      this.requestQueue.push({ prompt, resolve, reject });
      this.processQueue();
    });
  }

  async processQueue() {
    if (this.processing || this.requestQueue.length === 0) {
      return;
    }

    this.processing = true;

    while (this.requestQueue.length > 0) {
      const { prompt, resolve, reject } = this.requestQueue.shift();

      try {
        const video = await this.client.videos.create({
          model: 'sora-2',
          prompt,
        });
        resolve(video);
      } catch (error) {
        reject(error);
      }

      // Wait before next request
      if (this.requestQueue.length > 0) {
        await new Promise((r) => setTimeout(r, this.minDelay));
      }
    }

    this.processing = false;
  }
}

// Usage
const client = new RateLimitedClient(process.env.OPENAI_API_KEY);

// These will be automatically rate-limited
const video1 = await client.createVideo('Prompt 1');
const video2 = await client.createVideo('Prompt 2');
const video3 = await client.createVideo('Prompt 3');
```

---

## Testing Examples

### Unit Test

```javascript
import { jest } from '@jest/globals';
import OpenAI from 'openai';

jest.mock('openai');

describe('Video Creation', () => {
  it('should create video with valid prompt', async () => {
    const mockCreate = jest.fn().mockResolvedValue({
      id: 'video_123',
      status: 'queued',
      model: 'sora-2',
    });

    OpenAI.mockImplementation(() => ({
      videos: { create: mockCreate },
    }));

    const openai = new OpenAI({ apiKey: 'test-key' });
    const result = await openai.videos.create({
      model: 'sora-2',
      prompt: 'Test prompt',
    });

    expect(mockCreate).toHaveBeenCalledWith({
      model: 'sora-2',
      prompt: 'Test prompt',
    });
    expect(result.id).toBe('video_123');
  });
});
```

### Integration Test

```javascript
import request from 'supertest';
import app from './app';

describe('Video API', () => {
  it('POST /api/videos - creates video', async () => {
    const response = await request(app)
      .post('/api/videos')
      .send({ prompt: 'Test video' })
      .set('Authorization', 'Bearer test-token')
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.video).toHaveProperty('id');
  });

  it('GET /api/videos/:id - gets video status', async () => {
    const response = await request(app)
      .get('/api/videos/video_123')
      .set('Authorization', 'Bearer test-token')
      .expect(200);

    expect(response.body.video).toHaveProperty('status');
  });
});
```

---

## Environment Configuration

### .env.example

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_ORG_ID=org-your-org-id
OPENAI_PROJECT_ID=proj_your-project-id

# Application
NODE_ENV=development
PORT=3000
API_BASE_URL=http://localhost:3000

# Database (NeonDB recommended)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Redis (optional)
REDIS_URL=redis://localhost:6379

# Frontend
FRONTEND_URL=http://localhost:3001

# Webhook (optional)
WEBHOOK_SECRET=your-webhook-secret
WEBHOOK_URL=https://your-domain.com/webhooks/sora

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100

# Storage (optional - for video archival)
S3_BUCKET=your-bucket-name
S3_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

---

## Quick Deployment Commands

### Local Development

```bash
# Start backend
cd backend
npm install
npm run dev

# Start frontend (in new terminal)
cd frontend
npm install
npm run dev
```

### Docker

```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Production

```bash
# Build
npm run build

# Start with PM2
pm2 start dist/app.js --name sora-backend

# View logs
pm2 logs sora-backend

# Monitor
pm2 monit
```

---

## Performance Tips

1. **Use Redis for caching**
   - Cache video metadata
   - Store polling status
   - Reduce database queries

2. **Implement connection pooling**
   - Database: 20-50 connections
   - Redis: 10-20 connections

3. **Use background workers**
   - Separate status polling from API
   - Async video downloads
   - Scheduled cleanup jobs

4. **Enable compression**
   - Gzip responses
   - Compress video files before storage

5. **Implement rate limiting**
   - Protect API endpoints
   - Prevent abuse
   - Manage costs

---

## Cost Optimization

1. **Video Parameters**
   - Use standard quality when possible
   - Shorter durations = lower cost
   - Cache completed videos

2. **Quota Management**
   - Set user limits
   - Track usage per user
   - Implement billing

3. **Cleanup Strategy**
   - Delete old videos
   - Archive instead of delete
   - Implement expiration

4. **Efficient Polling**
   - Use webhooks instead of polling
   - Increase poll interval
   - Stop polling completed videos

---

This quick reference provides everything you need to get started with Sora 2 video generation. For detailed architecture and implementation, refer to the complete guide.
