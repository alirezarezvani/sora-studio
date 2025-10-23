# Mock Mode User Guide

## Quick Start

**Want to test Sora Studio without OpenAI credits? Use Mock Mode!**

---

## 🎯 What is Mock Mode?

Mock Mode allows you to test the complete Sora Studio video generation flow without:
- ❌ OpenAI API calls
- ❌ Using OpenAI credits
- ❌ Needing billing set up
- ❌ Backend server running

Instead, you get:
- ✅ Simulated video generation
- ✅ Real-time status updates
- ✅ Full UI/UX testing
- ✅ Sample videos pre-loaded

---

## 🚀 Enable Mock Mode

### Step 1: Edit Environment File

Open `/sora-frontend/.env.local` and set:

```bash
NEXT_PUBLIC_MOCK_MODE=true
```

### Step 2: Restart Development Server

```bash
cd sora-frontend
npm run dev
```

### Step 3: Verify Mock Mode

Visit http://localhost:3001

You should see a blue banner at the top:
> **Demo Mode Active** - No OpenAI API calls will be made. Videos are simulated for testing purposes.

---

## 🎬 Using Mock Mode

### Creating Videos

1. **Fill in the form:**
   - Enter a prompt (min 10 characters)
   - Select model (sora-2 or sora-2-pro)
   - Choose duration (4, 8, or 12 seconds)
   - Pick resolution (480p, 720p, 1080p)

2. **Click "Generate Video":**
   - Toast notification appears: "Demo video created!"
   - Video appears in gallery with "Queued" status

3. **Watch automatic progression:**
   - **0-2 seconds:** Status = "Queued" 🟡
   - **2-7 seconds:** Status = "In Progress" 🔵
   - **7+ seconds:** Status = "Completed" ✅

### Viewing Videos

**Gallery View:**
- 3 sample videos pre-loaded
- Your created videos appear below
- Filter by status: All, Completed, In Progress, Failed
- Sort by: Newest First, Oldest First

**Detail View:**
1. Click on any video card
2. See mock video player (completed videos)
3. View video details (model, duration, resolution)
4. Download or delete (demo mode indicators shown)

### Sample Videos

Mock Mode pre-loads 3 sample videos:

1. **Kite Flying Scene** (sora-2, 4s, 720p) - Completed
2. **Coffee Cup Steam** (sora-2-pro, 8s, 1080p) - Completed
3. **Mountain Drone Shot** (sora-2, 12s, 720p) - In Progress

---

## 🎨 Mock Mode Indicators

### Visual Cues

**Blue Banner:** At top of page
- "Demo Mode Active"
- Dismissible
- Only shows in mock mode

**Demo Mode Badge:** On video creation form
- Small blue pill: "Demo Mode"
- Top-right of form card

**Empty State Message:** When no videos
- "Demo Mode: Try creating a video to see the complete flow!"

### Toast Notifications

**Success Messages:**
- "Demo video created! Watch it progress through the generation stages."

**Info Messages:**
- "Demo Mode: In a real environment, the video file would download now."

**Mock Video Player:**
- Shows play icon and message
- "In a real environment, the generated video would play here"

---

## ⚙️ How It Works

### Technical Overview

```
1. User submits form
   ↓
2. API layer checks MOCK_MODE flag
   ↓
3. If true → Route to mockVideoApi
   ↓
4. Mock API creates video in memory
   ↓
5. Automatic timers progress status
   ↓
6. React Query updates UI in real-time
```

### Status Progression

```
Created → Queued (instant)
          ↓ (2 seconds)
      In Progress (30% complete)
          ↓ (5 seconds)
      Completed (100% complete)
```

### Network Simulation

Mock Mode simulates realistic API latency:
- Create video: 400-700ms
- Get video: 100-300ms
- List videos: 200-500ms
- Delete video: 200-400ms

---

## 🔄 Switching Between Modes

### From Mock to Real API

**1. Update `.env.local`:**
```bash
NEXT_PUBLIC_MOCK_MODE=false
```

**2. Ensure backend is running:**
```bash
cd sora-video-backend
npm run dev
```

**3. Restart frontend:**
```bash
cd sora-frontend
npm run dev
```

### From Real to Mock

Just set `NEXT_PUBLIC_MOCK_MODE=true` and restart.

---

## 🐛 Troubleshooting

### Mock Mode Not Working

**Problem:** Videos not appearing or status not updating

**Solutions:**
1. Check `.env.local` has `NEXT_PUBLIC_MOCK_MODE=true`
2. Restart dev server (stop and run `npm run dev` again)
3. Clear browser cache (Cmd/Ctrl + Shift + R)
4. Check browser console for errors

### No Blue Banner

**Problem:** Don't see "Demo Mode Active" banner

**Solutions:**
1. Verify `NEXT_PUBLIC_MOCK_MODE=true` in `.env.local`
2. Make sure you restarted the server after changing env
3. Check if banner was dismissed (refresh page to see it again)

### Videos Not Progressing

**Problem:** Videos stuck in "Queued" status

**Solution:**
- Mock timers should auto-progress
- If stuck, delete video and recreate
- Check browser console for JavaScript errors

---

## 📊 Limitations

**What Mock Mode Cannot Do:**

❌ Generate actual video files
❌ Download real MP4 files
❌ Make OpenAI API calls
❌ Test backend logic
❌ Validate API keys
❌ Test real error scenarios
❌ Persist videos across server restarts

**What Mock Mode CAN Do:**

✅ Test entire UI flow
✅ Validate form inputs
✅ Test status updates
✅ Verify animations
✅ Check responsive design
✅ Test toast notifications
✅ Validate user interactions

---

## 🎯 Best Use Cases

### Perfect For:

1. **Frontend Development**
   - Build UI components
   - Test user flows
   - Verify animations
   - Check responsive design

2. **Demo/Presentations**
   - Show off the UI
   - Demonstrate features
   - No API setup required
   - Instant results

3. **Testing Without Costs**
   - No OpenAI credits needed
   - No backend server needed
   - Fast iteration
   - No API rate limits

### Not Suitable For:

1. **Backend Testing**
   - Need real API integration
   - Database operations
   - Authentication flows

2. **Production**
   - Must use real API
   - Need actual video files
   - Require persistent storage

---

## 💡 Tips & Tricks

### Quick Testing

**Create multiple videos fast:**
1. Use short prompts (10+ chars)
2. Select sora-2 (faster in UI)
3. Create 3-4 videos quickly
4. Watch them all progress together

### Testing Filters

1. Create mix of videos
2. Wait for some to complete
3. Test "In Progress" filter
4. Test "Completed" filter
5. Verify counts are correct

### Testing Empty States

1. Delete all videos
2. Check empty state appears
3. Verify message is helpful
4. Create new video from empty state

---

## 📝 Sample Test Scenarios

### Scenario 1: Happy Path

1. ✅ Enable mock mode
2. ✅ Create video with valid prompt
3. ✅ Watch status progress
4. ✅ Click on completed video
5. ✅ Try to download (see demo toast)
6. ✅ Delete video

### Scenario 2: Form Validation

1. ✅ Try submitting with short prompt (< 10 chars)
2. ✅ See validation error
3. ✅ Fix prompt
4. ✅ Submit successfully

### Scenario 3: Multiple Videos

1. ✅ Create 5 videos quickly
2. ✅ Watch all progress simultaneously
3. ✅ Filter by "In Progress"
4. ✅ Wait for completion
5. ✅ Filter by "Completed"

---

## 🔐 Security Note

**Mock Mode is safe to use** because:
- No real API calls are made
- No credentials are sent
- No data leaves your browser
- All data is in-memory only

**Mock Mode is NOT for production** because:
- Data is not persisted
- No actual videos are generated
- No real authentication
- Limited to local testing

---

## 📚 Additional Resources

**Related Documentation:**
- [Day 5 Implementation Details](./DAY-5-IMPLEMENTATION.md)
- [Frontend README](./README.md)
- [Sora Implementation Guide](../sora-implementation-guide/README.md)

**Code References:**
- Mock Data: `/src/lib/mock/mockData.ts`
- Mock API: `/src/lib/mock/mockApi.ts`
- API Layer: `/src/lib/api/videos.ts`

---

## ✅ Quick Checklist

Before reporting an issue, verify:

- [ ] `NEXT_PUBLIC_MOCK_MODE=true` in `.env.local`
- [ ] Development server restarted after env change
- [ ] Blue banner visible at top
- [ ] "Demo Mode" badge on form
- [ ] Sample videos visible in gallery
- [ ] Browser console has no errors

---

**Need help?** Check the main README or Day 5 implementation docs for more details.

**Ready to use real API?** Set `NEXT_PUBLIC_MOCK_MODE=false` and start the backend server.
