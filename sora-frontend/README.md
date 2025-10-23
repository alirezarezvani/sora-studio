# Sora Studio Frontend

Modern Next.js 15 frontend for the Sora Studio AI video generation platform.

## Features

- **Video Creation Form**: Create videos with customizable prompts, models, durations, and resolutions
- **Real-time Status Tracking**: Auto-refresh video generation status every 10 seconds
- **Video Gallery**: Browse all your videos with filtering and sorting options
- **Video Detail Page**: View full video details, download, delete, or remix videos
- **Quota Display**: Track your monthly video generation quota
- **Responsive Design**: Mobile-first design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **API Client**: Axios
- **Icons**: Lucide React

## Project Structure

```
src/
├── app/
│   ├── dashboard/          # Main dashboard page
│   ├── videos/[id]/        # Video detail page
│   ├── layout.tsx          # Root layout with QueryProvider
│   └── page.tsx            # Home (redirects to dashboard)
├── components/
│   ├── ui/                 # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   └── Select.tsx
│   ├── VideoForm.tsx       # Video creation form
│   ├── VideoStatus.tsx     # Video status display
│   ├── VideoCard.tsx       # Video card for gallery
│   ├── VideoGallery.tsx    # Video grid with filters
│   └── QuotaDisplay.tsx    # Quota widget
├── hooks/
│   ├── useVideos.ts        # React Query hooks for video operations
│   └── useVideoPolling.ts  # Auto-refresh hook
├── lib/
│   └── api/
│       ├── client.ts       # Axios client with interceptors
│       └── videos.ts       # Video API methods
├── providers/
│   └── QueryProvider.tsx   # React Query provider
└── types/
    └── index.ts            # TypeScript interfaces
```

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on http://localhost:3000

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_MOCK_MODE=false
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   Navigate to http://localhost:3001

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:3000/api` |
| `NEXT_PUBLIC_MOCK_MODE` | Use mock data instead of API | `false` |

## Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build production bundle
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Components

### VideoForm
Video creation form with:
- Prompt input (10-500 characters)
- Model selection (sora-2 or sora-2-pro)
- Duration selection (4s, 8s, 12s)
- Resolution selection (480p, 720p, 1080p)
- Cost estimation
- Quota validation

### VideoGallery
Video grid with:
- Responsive layout (1-3 columns)
- Status filtering (All, Completed, In Progress, Failed)
- Sorting (Newest/Oldest first)
- Empty state handling
- Loading skeletons

### VideoStatus
Real-time status component with:
- Status badges (Queued, In Progress, Completed, Failed)
- Progress indicators
- Auto-refresh (polls every 10s when pending)
- Download and delete actions

### QuotaDisplay
Quota widget showing:
- Videos used / monthly limit
- Visual progress bar
- Cost tracking
- Warning states (>80% used)

## API Integration

All API calls go through the centralized Axios client (`src/lib/api/client.ts`) with:
- Automatic auth token injection from localStorage
- 401 error handling (redirects to /login)
- Error interceptors

### Video API Methods

```typescript
// Create video
videoApi.create({ prompt, model, seconds, size });

// Get video status
videoApi.getVideo(videoId);

// List videos
videoApi.listVideos(limit, offset);

// Delete video
videoApi.deleteVideo(videoId);

// Remix video
videoApi.remix(videoId, { prompt });

// Get download URL
videoApi.getDownloadUrl(videoId);
```

## React Query Hooks

```typescript
// Fetch videos list
const { data: videos, isLoading } = useVideos(limit, offset);

// Fetch single video
const { data: video } = useVideo(videoId);

// Create video (with automatic cache invalidation)
const createVideo = useCreateVideo();
await createVideo.mutateAsync(videoData);

// Delete video (with automatic cache invalidation)
const deleteVideo = useDeleteVideo();
await deleteVideo.mutateAsync(videoId);

// Auto-refresh video status when pending
useVideoPolling(video, enabled);
```

## Styling

Tailwind CSS with custom theme:

```javascript
// Primary color: Purple
colors: {
  primary: {
    500: '#8B5CF6',
    600: '#7c3aed',
    // ... other shades
  }
}
```

## Real-time Features

Videos in "queued" or "in_progress" status automatically refresh every 10 seconds using `useVideoPolling` hook. This ensures users see progress updates without manual refresh.

## Error Handling

- Form validation with inline error messages
- API error alerts with user-friendly messages
- Network error handling with retry logic
- 401 errors redirect to login page

## Future Enhancements (Day 5+)

- [ ] User authentication (login/register)
- [ ] User profile and settings
- [ ] Advanced video filters (by date, model, duration)
- [ ] Bulk operations (delete multiple videos)
- [ ] Video thumbnails from backend
- [ ] WebSocket for real-time status updates
- [ ] Admin dashboard for quota management
- [ ] Cost analytics and reporting

## Troubleshooting

### Build errors
```bash
# Clear cache and rebuild
rm -rf .next
npm run build
```

### API connection issues
- Ensure backend is running on http://localhost:3000
- Check CORS configuration in backend
- Verify `NEXT_PUBLIC_API_URL` in .env.local

### TypeScript errors
```bash
# Check types
npm run build
```

## Status

**Day 4 Complete** - Frontend Dashboard Implementation ✅

Implemented components:
- ✅ Video creation form with validation
- ✅ Real-time status tracking with auto-refresh
- ✅ Video gallery with filtering and sorting
- ✅ Quota display with warnings
- ✅ Complete dashboard layout
- ✅ Video detail page with remix functionality
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ TypeScript compilation without errors

Next: Day 5 - Advanced features and optimizations
