# 🎬 Master Prompt: Build Sora Studio - OpenAI Video API Web Interface

## Context

I need a complete, production-ready web application for the OpenAI Video API (Sora). Review the API documentation in `openai-video-api-guide.md` to understand all available endpoints and best practices. More comprehensive and detailled documentation on Sora API is in the '/sora-implementation-guide' folder. Start from the '/sora-implementation-guide/README.md' file in the folder.

---

## Project Requirements

### Core Objective
Build a modern, user-friendly web application that allows me to generate, monitor, and manage AI videos using OpenAI's Sora API with all available parameters.

---

## Technical Stack

**MUST USE:**
- Pure HTML/CSS/JavaScript (no frameworks - keep it simple!)
- Tailwind CSS (via CDN for styling)
- Font Awesome (via CDN for icons)
- Python HTTP server for local hosting
- `.env` file for API key storage (persistent across sessions)

**File Structure:**
```
/
├── index.html              # Main UI
├── src/
│   ├── app.js             # Application logic
│   └── config.js          # .env file loader
├── scripts/
│   └── start-server.sh    # Server startup script
├── docs/                  # Documentation
├── .env                   # API key storage
├── .env.example           # Template
└── .gitignore            # Protect secrets
```

---

## Critical Features (Must Implement All)

### 1. 🔐 API Key Management

**Requirements:**
- Load API key from `.env` file automatically on page load
- Priority: `.env` file → localStorage fallback
- Show success toast when loaded from `.env`
- Settings panel to manually add key if needed
- **Important:** API key should persist across browser sessions

**Implementation:**
```javascript
// config.js should:
- Fetch and parse .env file
- Extract OPENAI_API_KEY
- Provide getApiKey() method
- Handle errors gracefully
```

---

### 2. 🎬 Video Creation Form

**All Parameters:**
- **Prompt input** with:
  - Character counter (0/1000)
  - Multi-line textarea (4 rows minimum)
  - Example prompt templates button

- **Model selection:** sora-2 (default)

- **Duration selector:**
  - Visual buttons: 4s, 6s, 8s
  - Highlight selected option
  - Default: 4s

- **Resolution selector with visual preview:**
  - 720x1280 (Portrait - 9:16) - show vertical rectangle icon
  - 1024x1808 (Tall Portrait - 9:16 HD) - show tall rectangle
  - 1280x720 (Landscape - 16:9) - show horizontal rectangle
  - 1808x1024 (Wide Landscape - 16:9 HD) - show wide rectangle
  - Default: 720x1280

- **Optional file upload:**
  - Accept images and videos
  - Show preview after selection
  - Label: "Input Reference (Optional)"

- **Submit button:**
  - Text: "Generate Video"
  - Show loading state when clicked
  - Disable while processing

**Prompt Templates:**
Provide 10 example prompts in a modal:
- "A golden retriever puppy playing in a field of colorful wildflowers at sunset"
- "Ocean waves crashing against rocky cliffs during a storm"
- "Time-lapse of clouds moving across a vibrant sunset sky"
- "A close-up shot of a hummingbird hovering near a red hibiscus flower"
- "A robot dancing gracefully in the rain on a city street"
- etc.

---

### 3. 📊 Dashboard with Auto-Refresh

**CRITICAL REQUIREMENTS:**

**Auto-Refresh Logic (This Must Work Perfectly!):**
```javascript
// Every 10 seconds (configurable):
1. Find all jobs with status 'queued' or 'processing'
2. For each active job:
   - Call GET /videos/{id} to fetch latest status
   - Update local job data
   - Re-render UI IMMEDIATELY after each update
3. If status changes to 'completed':
   - Show success toast notification
   - Update progress bar to 100%
   - Show download/remix buttons
4. If status changes to 'failed':
   - Show error toast
   - Display error details
```

**Must Handle:**
- ✅ Transitions: queued → processing → completed
- ✅ Progress updates while processing (0% → 100%)
- ✅ Multiple jobs updating simultaneously
- ✅ UI re-rendering without manual refresh
- ✅ Toast notifications for completed videos

**Visual Indicators:**
- 🟡 Queued - Yellow badge
- 🔵 Processing - Blue badge with animated spinner
- 🟢 Completed - Green badge
- 🔴 Failed - Red badge

**Progress Bars:**
- Show for queued and processing jobs
- Animate width changes smoothly
- Display percentage text

**Job Cards Show:**
- Video ID (copyable)
- Status badge
- Prompt preview (first 100 chars)
- Created timestamp
- Duration and resolution
- Progress bar (if active)
- Action buttons: Details, Download, Remix, Delete

**Filter & Search:**
- Dropdown: All, Queued, Processing, Completed, Failed
- Search box: Filter by prompt or video ID
- Updates results in real-time

**Auto-Refresh Control:**
- Display: "Auto-refreshing every 10 seconds"
- Pause/Resume button
- Visual indicator when refreshing (spinning icon)

---

### 4. 🖼️ Gallery with Video Previews

**CRITICAL: Performance Optimization Required!**

**Two-Stage Loading (Must Implement This Way):**

**Stage 1 - Instant Thumbnails:**
```javascript
// On gallery load:
1. For each completed video:
   - Fetch thumbnail using variant='thumbnail' (fast, ~50-200KB)
   - Display immediately (<1 second load time)
   - Show with play icon overlay
```

**Stage 2 - Background Video Loading:**
```javascript
// After thumbnails shown:
2. Load full videos using variant='video' in background
3. When video loaded, replace thumbnail with video element
4. Video setup:
   - autoplay: false (don't start yet)
   - loop: true
   - muted: true (start muted)
   - playsinline: true (mobile compatibility)
```

**Hover Behavior:**
```javascript
onmouseover:
  - Play video
  - Unmute audio

onmouseout:
  - Pause video
  - Mute audio
  - Reset to start (currentTime = 0)
```

**Gallery Grid:**
- Responsive: 3 columns desktop, 2 tablet, 1 mobile
- Each card shows:
  - Video preview (thumbnail → video)
  - Prompt (first 80 chars)
  - Date created
  - Duration
  - Download button
  - Remix button

**Click Behavior:**
- Click card → Open details modal
- Click Download → Download directly
- Click Remix → Open remix form

---

### 5. 🎭 Remix Functionality

**Requirements:**
- Available only for completed videos
- Remix button on: Dashboard, Gallery, Details modal
- Clicking remix:
  - Prompts user for new prompt
  - Shows original prompt as reference
  - Calls POST /videos/{id}/remix
  - Creates new job linked to original
  - Shows "Remixed from: {original_id}" in job card

---

### 6. 👁️ Video Details Modal

**Show:**
- Video preview (with playback controls if completed)
- Full metadata:
  - Video ID (copyable)
  - Status
  - Progress
  - Model
  - Duration
  - Resolution
  - Created timestamp
  - Completed timestamp
  - Expiration timestamp
  - Remixed from ID (if applicable)
- Full prompt text
- Error details (if failed)
- Action buttons:
  - Download Video (if completed)
  - Remix Video (if completed)
  - Copy ID
  - Close

**Video Preview:**
```javascript
// For completed videos:
1. Show loading spinner initially
2. Fetch video using variant='video'
3. Display in <video> element with:
   - controls: true
   - autoplay: true
   - Full width/height
```

---

### 7. ⚙️ Settings Panel

**Configuration Options:**
- **API Key:**
  - Input field (password type)
  - Show/hide toggle
  - Note if loaded from .env (disable input, show message)
  - Save to localStorage button

- **Default Preferences:**
  - Default duration (4, 6, 8 seconds)
  - Default resolution (dropdown)
  - Auto-refresh interval (5-60 seconds)

- **Data Management:**
  - Export job history as JSON
  - Clear all local data button (with confirmation)

---

### 8. 📥 Download Functionality

**CRITICAL: Must Use Correct API Variant!**

```javascript
// API Call:
GET /videos/{id}/content?variant=video

// NOT variant=mp4 (this will fail!)

// Implementation:
async downloadVideo(videoId) {
  const blob = await client.downloadContent(videoId, 'video');
  const url = URL.createObjectURL(blob);

  // Trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = `sora-${videoId}.mp4`;
  a.click();

  // Cleanup
  URL.revokeObjectURL(url);
}
```

---

## API Integration Details

### OpenAI Video API Client

**Required Methods:**
```javascript
class OpenAIVideoClient {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseURL = 'https://api.openai.com/v1';
  }

  // Create video
  async createVideo({ prompt, model, seconds, size, inputReference })

  // List all videos
  async listVideos({ after, limit, order })

  // Get video status
  async retrieveVideo(videoId)

  // Delete video
  async deleteVideo(videoId)

  // Remix video
  async remixVideo(videoId, prompt)

  // Download video content
  async downloadContent(videoId, variant = 'video')
  // variant options: 'video', 'thumbnail', 'spritesheet'
}
```

**Error Handling:**
- Catch all API errors
- Show user-friendly error messages via toasts
- Log detailed errors to console
- Handle rate limits gracefully

---

## UI/UX Requirements

### Design System

**Colors:**
- Primary: Blue (#3B82F6)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)
- Processing: Blue (#3B82F6)

**Typography:**
- Clean, modern sans-serif
- Clear hierarchy
- Readable font sizes (14px minimum)

**Spacing:**
- Consistent padding and margins
- Generous whitespace
- Card-based layout

### Responsive Design
- Mobile-first approach
- Breakpoints: 640px, 768px, 1024px
- Touch-friendly buttons (min 44px height)
- Horizontal scrolling where needed

### Animations
- Smooth transitions (0.3s ease)
- Progress bar animations
- Loading spinners
- Toast slide-in animations
- Hover effects

### Toast Notifications

**Types:**
- Success (green): "Video completed!", "API key loaded"
- Error (red): "Download failed", "API error"
- Info (blue): "Creating video job", "Refreshing"
- Warning (yellow): "API key required"

**Position:** Bottom-right
**Duration:** 3 seconds
**Animation:** Slide in from right

---

## Navigation & Tabs

**Three Main Tabs:**
1. **Create Video** (default tab)
   - Icon: ➕
   - Show form

2. **Dashboard**
   - Icon: 📊
   - Show all jobs

3. **Gallery**
   - Icon: 🖼️
   - Show completed videos only

**Logo Click:**
- Click "Sora Studio" logo → Return to Create tab
- Add hover effect (opacity: 0.8)

---

## Local Storage & Data Persistence

**Store in localStorage:**
```javascript
{
  "openai_api_key": "sk-...",           // Fallback if no .env
  "video_jobs": [...],                   // All jobs
  "default_duration": "4",               // User preference
  "default_size": "720x1280",           // User preference
  "refresh_interval": "10"               // Seconds
}
```

**Job Object Structure:**
```javascript
{
  id: "video_xxx",
  prompt: "...",
  model: "sora-2",
  status: "completed",
  progress: 100,
  seconds: "8",
  size: "1280x720",
  created_at: 1234567890,
  completed_at: 1234567900,
  expires_at: 1234568900,
  remixed_from_video_id: null,  // or video_id if remix
  error: null  // or { code, message }
}
```

---

## Server Setup

### Start Server Script (scripts/start-server.sh)

```bash
#!/bin/bash
echo "🎬 Starting Sora Studio..."

# Check for .env file and API key
if [ -f ".env" ]; then
    if grep -q "OPENAI_API_KEY=sk-" .env; then
        echo "✅ Found API key in .env file"
    else
        echo "⚠️  No API key found in .env file"
        echo "   Edit .env and add: OPENAI_API_KEY=sk-your-key-here"
    fi
else
    echo "⚠️  No .env file found"
fi

echo "🚀 Starting server on http://localhost:8000"
python3 -m http.server 8000
```

### Startup Process

1. Make script executable: `chmod +x scripts/start-server.sh`
2. Run script: `./scripts/start-server.sh`
3. Server starts on http://localhost:8000
4. Opens in default browser automatically (optional)
5. Validates .env file exists and has API key

---

## Testing Checklist

### Must Verify These Work:

**API Key:**
- [x] Loads from .env automatically
- [x] Shows success toast
- [x] Falls back to localStorage if no .env
- [x] Can be set via Settings panel

**Video Creation:**
- [x] All parameters work
- [x] File upload works
- [x] Job created successfully
- [x] Shows in dashboard immediately

**Auto-Refresh:**
- [x] Starts automatically (every 10s)
- [x] Updates queued → processing
- [x] Updates processing → completed
- [x] Progress bar animates
- [x] Completed toast shows
- [x] UI updates without manual refresh

**Download:**
- [x] Uses variant='video' (not 'mp4'!)
- [x] Downloads as .mp4 file
- [x] File plays in video player

**Gallery:**
- [x] Thumbnails load in <1 second
- [x] Videos load in background
- [x] Hover plays video with audio
- [x] Mouse out pauses and resets

**Remix:**
- [x] Only available for completed videos
- [x] Creates new job
- [x] Links to original video
- [x] Shows in dashboard

---

## Common Pitfalls to Avoid

### ❌ DON'T:
1. Use `variant='mp4'` for downloads (use `variant='video'`)
2. Auto-play all gallery videos immediately (use thumbnails first)
3. Forget to re-render UI after status updates
4. Use frameworks (keep it vanilla JS)
5. Commit .env file to git

### ✅ DO:
1. Use `variant='video'` for downloads
2. Load thumbnails first, then videos in background
3. Force re-render after every job status update
4. Use async/await properly in auto-refresh
5. Add .env to .gitignore

---

## File Organization

```
sora-studio/
├── index.html              # Main UI (all HTML)
│
├── src/
│   ├── app.js             # Main application logic
│   │   ├── OpenAIVideoClient class
│   │   ├── app object (main controller)
│   │   ├── UI rendering functions
│   │   ├── Event handlers
│   │   └── Auto-refresh logic
│   │
│   └── config.js          # .env file loader
│       ├── Fetch .env
│       ├── Parse OPENAI_API_KEY
│       └── Provide getApiKey()
│
├── scripts/
│   └── start-server.sh    # Server startup
│
├── docs/
│   ├── START_HERE.md      # Quick start
│   ├── SETUP.md           # Detailed setup
│   └── openai-video-api-guide.md  # API reference
│
├── .env                   # Your API key (DO NOT COMMIT)
├── .env.example           # Template
├── .gitignore            # Protect secrets
├── LICENSE               # MIT
└── README.md             # Documentation
```

---

## Deliverables

### Must Provide:

1. **Complete working application**
   - All features functional
   - No bugs
   - Clean code with comments

2. **README.md** with:
   - Setup instructions (4 steps max)
   - Features overview
   - Usage guide
   - Troubleshooting
   - API integration details

3. **Local server running**
   - Accessible at http://localhost:8000
   - Serves all files correctly
   - .env file readable by JavaScript

4. **Documentation in docs/ folder**
   - Quick start guide
   - Detailed setup instructions
   - API reference included

---

## Success Criteria

### The App is Complete When:

✅ **Startup:**
- Run `./scripts/start-server.sh`
- Browser opens to http://localhost:8000
- API key loads from .env automatically
- No errors in console

✅ **Video Creation:**
- Fill form → Click generate
- Job appears in dashboard immediately
- Status: queued

✅ **Auto-Refresh:**
- Wait 10 seconds
- Status updates to processing
- Progress bar shows (e.g., 45%)
- Wait more
- Status updates to completed
- Toast notification shows
- Download button appears
- NO manual refresh needed!

✅ **Download:**
- Click download button
- Video downloads as .mp4
- File plays correctly

✅ **Gallery:**
- Switch to Gallery tab
- Thumbnails load instantly (<1 second)
- Hover over video
- Video plays with audio
- Move mouse away
- Video pauses and resets

✅ **Remix:**
- Click remix on completed video
- Enter new prompt
- New job created
- Shows "Remixed from: original_id"

---

## Example User Journey

```
1. Start server: ./scripts/start-server.sh
   ✅ See: "✅ Found API key in .env file"
   ✅ Browser opens to http://localhost:8000

2. Page loads
   ✅ Toast: "API key loaded from .env"
   ✅ No API key warning

3. Create video
   ✅ Enter: "A golden retriever puppy playing in a field"
   ✅ Select: 8 seconds, 1280x720 (Landscape)
   ✅ Click: "Generate Video"
   ✅ Toast: "Video job created successfully!"

4. Switch to Dashboard
   ✅ See job with status: 🟡 Queued
   ✅ Progress: 0%

5. Wait 10 seconds (auto-refresh)
   ✅ Status changes to: 🔵 Processing
   ✅ Progress: 25%
   ✅ No manual refresh needed!

6. Wait more (auto-refresh continues)
   ✅ Progress: 50%
   ✅ Progress: 75%
   ✅ Progress: 95%

7. Video completes
   ✅ Status changes to: 🟢 Completed
   ✅ Progress: 100%
   ✅ Toast: "Video completed! video_xxx"
   ✅ Download button appears
   ✅ Remix button appears

8. Download video
   ✅ Click "Download"
   ✅ File saves: sora-video_xxx.mp4
   ✅ Video plays correctly

9. View in Gallery
   ✅ Switch to Gallery tab
   ✅ Thumbnail loads instantly
   ✅ Hover over video
   ✅ Video plays with audio
   ✅ Move mouse away
   ✅ Video pauses

10. Remix video
    ✅ Click "Remix"
    ✅ Enter: "Same scene but at sunset"
    ✅ New job created
    ✅ Shows: "Remixed from: video_xxx"
```

---

## Code Quality Requirements

### JavaScript:
- Use modern ES6+ syntax
- Async/await for API calls
- Clear function names
- Comments for complex logic
- Error handling everywhere
- No console errors

### HTML:
- Semantic HTML5
- Accessible (ARIA labels where needed)
- Clean structure
- Proper indentation

### CSS (Tailwind):
- Use utility classes
- Consistent spacing
- Responsive breakpoints
- Custom animations in <style> tag

---

## Final Notes

### This Prompt Should Result In:

✅ A complete, production-ready web application
✅ All features working perfectly
✅ Auto-refresh that actually works
✅ Gallery with instant thumbnails
✅ Downloads that work (using correct API variant)
✅ Clean, organized code
✅ Professional documentation
✅ Local server that starts easily
✅ .env integration that persists

### The Developer Should:

1. Read the OpenAI API guide first
2. Implement features in order (API key → Create → Dashboard → Gallery)
3. Test auto-refresh thoroughly (most critical feature)
4. Use variant='video' for downloads (NOT 'mp4')
5. Implement two-stage gallery loading for performance
6. Add proper error handling everywhere
7. Make it beautiful with Tailwind CSS
8. Test the complete user journey
9. Write clear documentation

---

## API Reference Quick Links

**Endpoints:**
- POST /videos - Create video
- GET /videos - List videos
- GET /videos/{id} - Get status
- GET /videos/{id}/content?variant=video - Download
- POST /videos/{id}/remix - Remix
- DELETE /videos/{id} - Delete

**Variants:**
- `variant=thumbnail` - Static image (fast)
- `variant=video` - Full MP4 (for download/playback)
- `variant=spritesheet` - Preview frames

---

## Success = Zero Manual Intervention

**User should only need to:**
1. Add API key to .env
2. Run ./scripts/start-server.sh
3. Use the app

**Everything else should be automatic:**
- Server starts
- API key loads
- Videos generate
- Status updates
- Downloads work
- Gallery loads fast
- Everything just works! ✨