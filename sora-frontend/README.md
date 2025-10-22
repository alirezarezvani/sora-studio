# Sora Studio Frontend

Frontend web application for Sora Studio - AI-powered video generation platform.

## Features

- Modern Next.js 15 with App Router
- TypeScript for type safety
- Tailwind CSS for styling
- React Query for data fetching and caching
- Responsive design
- Real-time video status updates

## Prerequisites

- Node.js 18+ (LTS)
- npm or yarn
- Backend API running (see backend README)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Update `NEXT_PUBLIC_API_URL` to point to your backend API (default: `http://localhost:3000/api`).

### 3. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3001`.

## Development

### Available Scripts

- `npm run dev` - Start development server on port 3001
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── app/             # Next.js App Router pages
│   ├── layout.tsx   # Root layout
│   ├── page.tsx     # Home page
│   └── globals.css  # Global styles
├── components/      # Reusable React components
├── lib/             # Utility libraries
│   └── api/         # API client and methods
│       ├── client.ts   # Axios client
│       └── videos.ts   # Video API methods
└── types/           # TypeScript type definitions
    └── index.ts     # Shared types
```

## Planned Features

### Video Creation
- Text prompt input
- Model selection (sora-2 / sora-2-pro)
- Video parameter configuration
- Real-time progress tracking

### Video Management
- Video gallery view
- Status tracking
- Download completed videos
- Delete videos
- Video remixing

### User Interface
- Responsive design
- Dark mode support
- Loading states
- Error handling
- Optimistic updates

## API Integration

The frontend connects to the backend API at `NEXT_PUBLIC_API_URL`. All API calls are made through the `videoApi` object in `src/lib/api/videos.ts`:

```typescript
// Create video
const video = await videoApi.create({ prompt: "..." });

// Get video status
const status = await videoApi.getVideo(videoId);

// List videos
const videos = await videoApi.listVideos(20, 0);

// Download video
const url = videoApi.getDownloadUrl(videoId);
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend API URL (default: http://localhost:3000/api)

## Deployment

### Build

```bash
npm run build
```

### Deploy to Vercel

```bash
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

## Status

Day 1 Complete - Project setup and configuration ✅

Next: Day 2 - Video creation UI components
