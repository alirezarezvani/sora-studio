# Testing the Sora Video API

## Quick Start

### 1. Prerequisites
- OpenAI API key with Sora 2 access
- Node.js installed
- All dependencies installed (`npm install`)

### 2. Environment Setup
Create `.env` file:
```bash
OPENAI_API_KEY=your-api-key-here
OPENAI_ORG_ID=your-org-id
OPENAI_PROJECT_ID=your-project-id
PORT=3000
NODE_ENV=development
```

### 3. Start the Server
```bash
npm run dev
```

You should see:
```
🔍 Testing connections...
✅ Database connected successfully
✅ OpenAI API connected successfully
✅ Redis connected successfully
🚀 Sora Studio API running on port 3000
📍 Environment: development
```

### 4. Run Automated Tests
In a new terminal:
```bash
npm run test:api
```

## Manual API Testing

### Test 1: Health Check
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-22T...",
  "uptime": 123.456
}
```

### Test 2: Create a Video

**Basic Request:**
```bash
curl -X POST http://localhost:3000/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A serene lake at sunset with mountains in the background"
  }'
```

**With Options:**
```bash
curl -X POST http://localhost:3000/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A cat wearing sunglasses riding a skateboard",
    "model": "sora-2",
    "size": "1024x1808",
    "seconds": "8"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "video_abc123",
    "object": "video",
    "model": "sora-2",
    "status": "queued",
    "progress": 0,
    "created_at": 1729612800,
    "size": "1024x1808",
    "seconds": "8"
  }
}
```

**Save the video ID** for next steps!

### Test 3: Check Video Status
```bash
# Replace video_abc123 with your actual video ID
curl http://localhost:3000/api/videos/video_abc123
```

Response (in progress):
```json
{
  "success": true,
  "data": {
    "id": "video_abc123",
    "status": "in_progress",
    "progress": 45,
    ...
  }
}
```

Response (completed):
```json
{
  "success": true,
  "data": {
    "id": "video_abc123",
    "status": "completed",
    "progress": 100,
    "file_url": "https://...",
    "thumbnail_url": "https://...",
    ...
  }
}
```

### Test 4: List Videos
```bash
# List all videos
curl http://localhost:3000/api/videos

# With limit
curl http://localhost:3000/api/videos?limit=5

# With pagination
curl http://localhost:3000/api/videos?limit=10&after=cursor_string
```

Expected response:
```json
{
  "success": true,
  "data": [
    {
      "id": "video_abc123",
      "status": "completed",
      ...
    },
    ...
  ],
  "has_more": false
}
```

### Test 5: Download Video
**Only works when status is "completed"**

```bash
curl http://localhost:3000/api/videos/video_abc123/download \
  --output my_video.mp4
```

This will download the MP4 file to `my_video.mp4`.

### Test 6: Remix Video
**Requires the source video to be completed**

```bash
curl -X POST http://localhost:3000/api/videos/video_abc123/remix \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Extend the scene with birds flying over the lake"
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "video_def456",
    "status": "queued",
    "remixed_from_video_id": "video_abc123",
    ...
  }
}
```

### Test 7: Delete Video
```bash
curl -X DELETE http://localhost:3000/api/videos/video_abc123
```

Expected response:
```json
{
  "success": true,
  "data": {
    "id": "video_abc123",
    "deleted": true
  }
}
```

## Error Testing

### Test Invalid Requests

**Missing Prompt:**
```bash
curl -X POST http://localhost:3000/api/videos \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected response (400):
```json
{
  "success": false,
  "error": "Prompt is required and must be a non-empty string"
}
```

**Invalid Model:**
```bash
curl -X POST http://localhost:3000/api/videos \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test",
    "model": "invalid-model"
  }'
```

Expected response (400):
```json
{
  "success": false,
  "error": "Invalid model. Must be \"sora-2\" or \"sora-2-pro\""
}
```

**Non-existent Video:**
```bash
curl http://localhost:3000/api/videos/video_nonexistent
```

Expected response (404):
```json
{
  "success": false,
  "error": "Video not found"
}
```

## Using Postman/Insomnia

### Import This Collection

Create a new collection with these requests:

1. **Create Video**
   - Method: POST
   - URL: `http://localhost:3000/api/videos`
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "prompt": "A beautiful sunset over the ocean",
       "model": "sora-2"
     }
     ```

2. **Get Video Status**
   - Method: GET
   - URL: `http://localhost:3000/api/videos/{{videoId}}`

3. **List Videos**
   - Method: GET
   - URL: `http://localhost:3000/api/videos?limit=5`

4. **Download Video**
   - Method: GET
   - URL: `http://localhost:3000/api/videos/{{videoId}}/download`
   - Send and Download: Yes

5. **Remix Video**
   - Method: POST
   - URL: `http://localhost:3000/api/videos/{{videoId}}/remix`
   - Headers: `Content-Type: application/json`
   - Body (JSON):
     ```json
     {
       "prompt": "Extend with dolphins jumping"
     }
     ```

6. **Delete Video**
   - Method: DELETE
   - URL: `http://localhost:3000/api/videos/{{videoId}}`

## Workflow Example

Here's a complete workflow from creation to download:

```bash
# 1. Create video
VIDEO_ID=$(curl -s -X POST http://localhost:3000/api/videos \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A cat playing piano"}' | \
  jq -r '.data.id')

echo "Created video: $VIDEO_ID"

# 2. Poll status until complete (repeat every 10 seconds)
while true; do
  STATUS=$(curl -s http://localhost:3000/api/videos/$VIDEO_ID | \
    jq -r '.data.status')

  echo "Status: $STATUS"

  if [ "$STATUS" = "completed" ]; then
    break
  fi

  if [ "$STATUS" = "failed" ]; then
    echo "Video generation failed!"
    exit 1
  fi

  sleep 10
done

# 3. Download video
curl http://localhost:3000/api/videos/$VIDEO_ID/download \
  --output video_$VIDEO_ID.mp4

echo "Video downloaded: video_$VIDEO_ID.mp4"
```

## Troubleshooting

### Server Won't Start
- Check `.env` file exists with valid API keys
- Ensure PostgreSQL and Redis are running
- Check port 3000 is not in use

### API Returns 401 Unauthorized
- Verify `OPENAI_API_KEY` in `.env`
- Check your OpenAI account has Sora 2 access

### Video Status Stays "queued"
- Video generation can take several minutes
- Check OpenAI API status
- Verify your API quota isn't exceeded

### Download Fails
- Video must be status "completed"
- Download URLs expire after 1 hour
- Check video hasn't been deleted

### TypeScript Errors
- Run `npm run build` to check compilation
- Ensure all dependencies installed

## Monitoring

### Check Logs
The server logs all operations:
```
[SoraService] Creating video with prompt: "A cat playing piano"
[SoraService] Video created successfully: video_abc123, status: queued
[VideoController] Error getting video: Video not found
```

### Watch Logs
```bash
# macOS/Linux
tail -f logs/app.log

# Or just watch console output when running npm run dev
```

## Next Steps

After confirming the API works:
1. Test with different prompts and options
2. Verify error handling
3. Check response times
4. Test edge cases (very long prompts, invalid IDs, etc.)
5. Move on to Day 3: Database Integration

---

*For automated testing script, run: `npm run test:api`*
