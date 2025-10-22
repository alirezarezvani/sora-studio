# Sora 2 Troubleshooting Guide & FAQ

## Table of Contents
1. [Common Issues & Solutions](#common-issues--solutions)
2. [API Error Codes](#api-error-codes)
3. [Performance Issues](#performance-issues)
4. [Deployment Problems](#deployment-problems)
5. [Security Issues](#security-issues)
6. [FAQ](#faq)
7. [Debug Checklist](#debug-checklist)

---

## Common Issues & Solutions

### Issue 1: "Invalid API Key" Error

**Symptoms:**
```
Error: 401 Unauthorized - Invalid API key
```

**Causes:**
- API key not set correctly
- Wrong environment variable name
- API key doesn't have Sora 2 access
- Organization/project ID mismatch

**Solutions:**

1. **Verify API Key is Set:**
```bash
echo $OPENAI_API_KEY
# Should output: sk-proj-...
```

2. **Check Environment Variable:**
```typescript
// backend/src/config/openai.ts
console.log('API Key:', process.env.OPENAI_API_KEY?.substring(0, 10) + '...');
```

3. **Verify Sora 2 Access:**
```javascript
// Test script
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

try {
  const models = await openai.models.list();
  console.log('API Key is valid');
} catch (error) {
  console.error('API Key issue:', error.message);
}
```

4. **Check Organization/Project IDs:**
```javascript
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  organization: process.env.OPENAI_ORG_ID,  // Check this
  project: process.env.OPENAI_PROJECT_ID,   // And this
});
```

---

### Issue 2: Video Status Stuck at "Queued"

**Symptoms:**
- Video never progresses from "queued" status
- Status polling returns same result
- No progress updates

**Causes:**
- Status poller worker not running
- Network connectivity issues
- OpenAI service issues
- Rate limiting

**Solutions:**

1. **Verify Worker is Running:**
```bash
# Check if worker process is running
ps aux | grep status-poller

# Check worker logs
pm2 logs status-poller
# or
docker logs worker-container
```

2. **Manually Check Status:**
```javascript
// Manual status check
const video = await openai.videos.retrieve('video_123');
console.log('Current status:', video.status);
console.log('Progress:', video.progress);
```

3. **Check Rate Limits:**
```javascript
// Add rate limit logging
try {
  const video = await openai.videos.retrieve('video_123');
} catch (error) {
  if (error.status === 429) {
    console.error('Rate limited! Wait before retrying.');
  }
}
```

4. **Restart Worker:**
```bash
pm2 restart status-poller
# or
docker-compose restart worker
```

---

### Issue 3: "Cannot Download Video" Error

**Symptoms:**
```
Error downloading video: Video not found
```

**Causes:**
- Video not completed yet
- Video ID incorrect
- Video expired
- Network issues

**Solutions:**

1. **Verify Video is Completed:**
```javascript
const video = await openai.videos.retrieve(videoId);

if (video.status !== 'completed') {
  throw new Error(`Video not ready. Status: ${video.status}`);
}

if (video.expires_at && video.expires_at < Date.now() / 1000) {
  throw new Error('Video has expired');
}
```

2. **Check Video ID Format:**
```javascript
// Valid format: video_abc123
if (!videoId.startsWith('video_')) {
  throw new Error('Invalid video ID format');
}
```

3. **Test Download with Curl:**
```bash
curl -o test.mp4 https://api.openai.com/v1/videos/video_123/content \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

4. **Handle Timeouts:**
```javascript
const timeout = 60000; // 60 seconds

const downloadPromise = openai.videos.downloadContent(videoId);
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new Error('Download timeout')), timeout)
);

const response = await Promise.race([downloadPromise, timeoutPromise]);
```

---

### Issue 4: Database Connection Errors

**Symptoms:**
```
Error: Connection terminated unexpectedly
Error: too many clients already
```

**Causes:**
- Connection pool exhausted
- Database credentials incorrect
- Database server down
- SSL/TLS issues

**Solutions:**

1. **Check Database Connection:**
```javascript
// Test connection
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

try {
  const result = await pool.query('SELECT NOW()');
  console.log('✅ Database connected:', result.rows[0]);
} catch (error) {
  console.error('❌ Database error:', error.message);
}
```

2. **Increase Pool Size:**
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,              // Increase from default
  min: 5,
  idleTimeoutMillis: 30000,
});
```

3. **Check SSL Configuration:**
```javascript
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,  // For development only
  },
});
```

4. **Monitor Connections:**
```javascript
// Log pool stats
setInterval(() => {
  console.log('Pool:', {
    total: pool.totalCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
  });
}, 60000);
```

---

### Issue 5: Frontend Not Updating

**Symptoms:**
- UI doesn't show new videos
- Status not updating in real-time
- Stale data displayed

**Causes:**
- Polling not configured
- Cache issues
- State management problems
- API errors not handled

**Solutions:**

1. **Verify Polling Setup:**
```typescript
// React Query polling
const { data, refetch } = useQuery({
  queryKey: ['video', videoId],
  queryFn: () => fetchVideo(videoId),
  refetchInterval: 5000,  // Poll every 5 seconds
  enabled: !!videoId,
});
```

2. **Clear Cache:**
```typescript
// Force refetch
import { useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();
queryClient.invalidateQueries({ queryKey: ['videos'] });
```

3. **Check Network Tab:**
```
Open browser DevTools → Network tab
Look for:
- Failed requests (red)
- 4xx/5xx errors
- CORS issues
```

4. **Add Error Boundaries:**
```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error }) {
  return (
    <div>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
    </div>
  );
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <VideoList />
</ErrorBoundary>
```

---

### Issue 6: High API Costs

**Symptoms:**
- Unexpected high bills
- Rapid credit consumption
- Usage spikes

**Causes:**
- No rate limiting
- Users creating too many videos
- Inefficient polling
- No quota management

**Solutions:**

1. **Implement Rate Limiting:**
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // 10 requests per window
  standardHeaders: true,
});

app.use('/api/videos', limiter);
```

2. **Add User Quotas:**
```javascript
async function checkUserQuota(userId) {
  const count = await db.query(
    'SELECT COUNT(*) FROM videos WHERE user_id = $1 AND created_at > NOW() - INTERVAL \'1 day\'',
    [userId]
  );
  
  if (count.rows[0].count >= 10) {
    throw new Error('Daily quota exceeded');
  }
}
```

3. **Optimize Polling:**
```javascript
// Instead of polling every 5 seconds:
// Use exponential backoff
let interval = 5000;
const maxInterval = 60000;

const poll = async () => {
  const video = await checkStatus(videoId);
  
  if (video.status === 'completed' || video.status === 'failed') {
    return;
  }
  
  interval = Math.min(interval * 1.5, maxInterval);
  setTimeout(poll, interval);
};
```

4. **Implement Webhooks:**
```javascript
// Replace polling with webhooks
app.post('/webhooks/sora', async (req, res) => {
  const event = req.body;
  
  if (event.type === 'video.completed') {
    await handleCompletion(event.data);
  }
  
  res.json({ received: true });
});
```

---

### Issue 7: Memory Leaks

**Symptoms:**
- Application memory usage grows over time
- Server crashes after running for hours
- Slow performance over time

**Causes:**
- Unclosed database connections
- Event listeners not removed
- Large objects in memory
- Caching without expiration

**Solutions:**

1. **Profile Memory Usage:**
```javascript
// Add memory monitoring
setInterval(() => {
  const used = process.memoryUsage();
  console.log('Memory:', {
    rss: `${Math.round(used.rss / 1024 / 1024)}MB`,
    heapTotal: `${Math.round(used.heapTotal / 1024 / 1024)}MB`,
    heapUsed: `${Math.round(used.heapUsed / 1024 / 1024)}MB`,
  });
}, 60000);
```

2. **Clean Up Connections:**
```javascript
// Properly close connections
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await pool.end();
  await redis.quit();
  process.exit(0);
});
```

3. **Limit Cache Size:**
```javascript
// LRU cache with size limit
import LRU from 'lru-cache';

const cache = new LRU({
  max: 500,          // Max 500 items
  maxAge: 3600000,   // 1 hour TTL
});
```

4. **Use Streams for Large Files:**
```javascript
// Stream video downloads instead of loading into memory
async function downloadVideo(videoId, filePath) {
  const response = await openai.videos.downloadContent(videoId);
  const fileStream = fs.createWriteStream(filePath);
  
  const stream = response.body;
  stream.pipe(fileStream);
  
  return new Promise((resolve, reject) => {
    fileStream.on('finish', resolve);
    fileStream.on('error', reject);
  });
}
```

---

## API Error Codes

### OpenAI Error Codes

| Code | Meaning | Solution |
|------|---------|----------|
| 401 | Invalid API key | Check API key and permissions |
| 403 | Forbidden - No access | Verify Sora 2 access enabled |
| 404 | Resource not found | Check video ID format |
| 429 | Rate limited | Implement backoff, reduce requests |
| 500 | Server error | Retry with exponential backoff |
| 503 | Service unavailable | OpenAI service issue, wait and retry |

### Custom Error Handling

```typescript
class APIError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Usage
function handleAPIError(error: any) {
  if (error.status === 401) {
    throw new APIError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }
  
  if (error.status === 429) {
    throw new APIError('Rate limited', 429, 'RATE_LIMITED');
  }
  
  if (error.status === 404) {
    throw new APIError('Video not found', 404, 'VIDEO_NOT_FOUND');
  }
  
  throw new APIError('Unknown error', 500, 'UNKNOWN_ERROR');
}
```

---

## Performance Issues

### Slow API Responses

**Problem:** API endpoints taking >1 second

**Solutions:**

1. **Add Database Indexes:**
```sql
-- Critical indexes
CREATE INDEX idx_videos_user_status ON videos(user_id, status);
CREATE INDEX idx_videos_created ON videos(created_at DESC);
CREATE INDEX idx_videos_status ON videos(status) WHERE status IN ('queued', 'in_progress');
```

2. **Implement Caching:**
```typescript
// Redis caching layer
async function getCachedVideo(videoId: string) {
  const key = `video:${videoId}`;
  const cached = await redis.get(key);
  
  if (cached) {
    return JSON.parse(cached);
  }
  
  const video = await db.fetchVideo(videoId);
  await redis.setex(key, 3600, JSON.stringify(video));
  
  return video;
}
```

3. **Optimize Queries:**
```sql
-- Before: N+1 query problem
SELECT * FROM videos WHERE user_id = '123';
-- Then for each video:
SELECT * FROM video_events WHERE video_id = 'video_id';

-- After: Single query with join
SELECT v.*, json_agg(e.*) as events
FROM videos v
LEFT JOIN video_events e ON e.video_id = v.id
WHERE v.user_id = '123'
GROUP BY v.id;
```

4. **Add Connection Pooling:**
```typescript
const pool = new Pool({
  max: 20,              // Maximum connections
  min: 5,               // Minimum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

---

### High Memory Usage

**Problem:** Server using >1GB RAM

**Solutions:**

1. **Stream Large Files:**
```typescript
// Don't load entire video into memory
router.get('/videos/:id/download', async (req, res) => {
  const response = await openai.videos.downloadContent(req.params.id);
  response.body.pipe(res);
});
```

2. **Limit Query Results:**
```sql
-- Always use LIMIT
SELECT * FROM videos 
ORDER BY created_at DESC 
LIMIT 100;  -- Don't fetch all rows
```

3. **Clean Up Resources:**
```typescript
// Use try-finally to ensure cleanup
let connection;
try {
  connection = await pool.connect();
  await connection.query('...');
} finally {
  if (connection) {
    connection.release();
  }
}
```

---

## Deployment Problems

### Docker Build Failures

**Issue:** `docker build` fails

**Solutions:**

1. **Check Node Version:**
```dockerfile
# Use specific Node version
FROM node:18-alpine

# Verify
RUN node --version
```

2. **Fix Permission Issues:**
```dockerfile
# Set proper permissions
RUN chown -R node:node /app
USER node
```

3. **Handle Build Args:**
```dockerfile
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV
RUN npm ci --only=production
```

4. **Debug Build:**
```bash
# Build with verbose output
docker build --no-cache --progress=plain -t app .
```

---

### Database Migration Issues

**Issue:** Migrations fail in production

**Solutions:**

1. **Run Migrations Separately:**
```bash
# Don't run migrations in app startup
# Run as separate step in deployment
npm run migrate
npm start
```

2. **Use Transaction Migrations:**
```sql
BEGIN;
  ALTER TABLE videos ADD COLUMN new_field TEXT;
  -- More changes...
COMMIT;
```

3. **Add Rollback Scripts:**
```sql
-- migration-up.sql
ALTER TABLE videos ADD COLUMN quality TEXT;

-- migration-down.sql
ALTER TABLE videos DROP COLUMN quality;
```

---

## Security Issues

### API Key Exposure

**Problem:** API key leaked in client-side code

**Impact:** ⚠️ CRITICAL - Immediate action required

**Solutions:**

1. **Immediate Actions:**
```bash
# 1. Revoke compromised key immediately
# Go to: https://platform.openai.com/api-keys
# Click "Revoke" on compromised key

# 2. Generate new key

# 3. Update environment variables
export OPENAI_API_KEY=sk-proj-NEW_KEY
```

2. **Prevent Future Leaks:**
```javascript
// ❌ NEVER do this
const openai = new OpenAI({
  apiKey: 'sk-proj-12345...',  // Hardcoded key
});

// ✅ Always use environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
```

3. **Add to .gitignore:**
```
.env
.env.local
.env.*.local
```

4. **Use Secrets Management:**
```bash
# AWS Secrets Manager
aws secretsmanager get-secret-value --secret-id openai-api-key

# Or use environment variables in deployment platform
# Vercel, Railway, etc.
```

---

### SQL Injection

**Problem:** Vulnerable to SQL injection

**Solution:**

```typescript
// ❌ NEVER concatenate user input
const query = `SELECT * FROM videos WHERE id = '${req.params.id}'`;

// ✅ Always use parameterized queries
const query = 'SELECT * FROM videos WHERE id = $1';
await pool.query(query, [req.params.id]);
```

---

## FAQ

### Q1: How long does video generation take?

**A:** Typically 30 seconds to 5 minutes, depending on:
- Video length (5s vs 20s)
- Quality (standard vs high)
- Current API load
- Prompt complexity

**Recommendation:** Set timeout of 10 minutes, implement progress tracking.

---

### Q2: What's the maximum video length?

**A:** Sora 2 typically supports up to 20 seconds per generation. For longer videos:
- Generate multiple clips
- Use remix to extend
- Combine clips in post-processing

---

### Q3: How much does each video cost?

**A:** Pricing varies by:
- Video length
- Quality setting
- Resolution

**Example costs:**
- 5s standard quality: ~$0.50
- 10s high quality: ~$2.00

Check current pricing: https://openai.com/pricing

---

### Q4: Can I generate videos without credit card?

**A:** You need:
- OpenAI account with billing enabled
- Valid payment method
- Available credits

Free tier may not include Sora 2 access.

---

### Q5: How do I handle multiple concurrent users?

**A:** Implement:
1. Rate limiting per user
2. Job queue (Redis/Bull)
3. User quotas
4. Background workers

Example:
```typescript
import Queue from 'bull';

const videoQueue = new Queue('videos', process.env.REDIS_URL);

// Add to queue instead of processing immediately
app.post('/videos', async (req, res) => {
  const job = await videoQueue.add({
    userId: req.user.id,
    prompt: req.body.prompt,
  });
  
  res.json({ jobId: job.id });
});
```

---

### Q6: Can I edit generated videos?

**A:** Sora 2 doesn't support direct editing, but you can:
- Use remix to modify
- Download and edit externally
- Chain multiple remixes
- Combine with video editing tools

---

### Q7: What happens when videos expire?

**A:** Videos expire after a certain period (check API docs for current value).

**Before expiration:**
- Download important videos
- Store in your cloud storage
- Archive to S3/CloudFlare R2

```typescript
// Auto-archive completed videos
async function archiveVideo(videoId: string) {
  const buffer = await soraService.downloadVideoContent(videoId);
  
  // Upload to S3
  await s3.upload({
    Bucket: 'my-videos',
    Key: `videos/${videoId}.mp4`,
    Body: buffer,
  });
}
```

---

### Q8: How do I handle failed videos?

**A:** Implement retry logic:

```typescript
async function createVideoWithRetry(prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await openai.videos.create({ model: 'sora-2', prompt });
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // Wait before retry (exponential backoff)
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

---

## Debug Checklist

Use this checklist when debugging issues:

### API Issues
- [ ] API key is valid and not expired
- [ ] API key has correct permissions
- [ ] Environment variables are loaded
- [ ] Request format matches API documentation
- [ ] Headers are correct (Authorization, Content-Type)
- [ ] Rate limits not exceeded
- [ ] Network connectivity is working

### Database Issues
- [ ] Connection string is correct
- [ ] Database credentials are valid
- [ ] Tables and indexes exist
- [ ] Connection pool has capacity
- [ ] SSL/TLS configured correctly
- [ ] Migrations have run
- [ ] Queries are parameterized (no SQL injection)

### Frontend Issues
- [ ] API endpoint URL is correct
- [ ] CORS is configured properly
- [ ] Authentication token is sent
- [ ] Error handling is implemented
- [ ] State management is working
- [ ] Network requests visible in DevTools
- [ ] Console shows no errors

### Performance Issues
- [ ] Database indexes exist
- [ ] Caching is implemented
- [ ] Connection pooling configured
- [ ] No N+1 query problems
- [ ] Large files are streamed
- [ ] Memory usage is monitored

### Deployment Issues
- [ ] Environment variables set in production
- [ ] Database migrations ran
- [ ] SSL certificates valid
- [ ] Health checks passing
- [ ] Logs are accessible
- [ ] Monitoring is active

---

## Getting Help

### Support Channels

1. **OpenAI Support**
   - Community Forum: https://community.openai.com
   - Help Center: https://help.openai.com
   - API Status: https://status.openai.com

2. **Developer Resources**
   - API Documentation: https://platform.openai.com/docs
   - GitHub Issues: Report bugs and request features
   - Stack Overflow: Tag questions with `openai-api`

3. **Emergency Issues**
   - API Key Compromised: Immediately revoke at https://platform.openai.com/api-keys
   - Service Outage: Check https://status.openai.com
   - Billing Issues: Contact OpenAI billing support

---

## Debugging Tools

### Essential Tools

1. **Postman/Insomnia**
   - Test API endpoints
   - Inspect request/response
   - Save test collections

2. **Database Clients**
   - TablePlus
   - pgAdmin
   - DBeaver

3. **Redis Clients**
   - Redis Commander
   - RedisInsight

4. **Monitoring**
   - New Relic
   - DataDog
   - Sentry

### Logging Best Practices

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Usage
logger.info('Video created', { videoId: video.id, userId: user.id });
logger.error('Video creation failed', { error: error.message, stack: error.stack });
```

---

## Summary

This troubleshooting guide covers the most common issues you'll encounter when integrating Sora 2. Remember:

1. **Always check logs first** - They often reveal the root cause
2. **Test in isolation** - Verify each component separately
3. **Monitor proactively** - Set up alerts before issues occur
4. **Document solutions** - Keep track of fixes for your team
5. **Ask for help** - Use community resources when stuck

For additional help, refer to:
- Complete Implementation Guide
- Quick Reference documentation
- OpenAI API documentation
