# Sora Studio Backend

Backend API for Sora Studio - AI-powered video generation platform using OpenAI's Sora 2 model.

## Features

- Video creation from text prompts
- Real-time status tracking
- Video remixing and iteration
- PostgreSQL database for persistence
- Redis caching for performance
- RESTful API architecture
- TypeScript for type safety

## Prerequisites

- Node.js 22+ (LTS)
- PostgreSQL 14+
- Redis 6+ (optional but recommended)
- OpenAI API key with Sora 2 access

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:
- `OPENAI_API_KEY` - Your OpenAI API key
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string (optional)

### 3. Create Database Schema

```bash
psql $DATABASE_URL -f schema.sql
```

Or manually run the SQL commands in `schema.sql`.

### 4. Test Connections

```bash
npm run test:connections
```

This will verify connections to:
- PostgreSQL database
- Redis cache
- OpenAI API

## Development

Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

## Testing

Run tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Generate coverage report:

```bash
npm run test:coverage
```

## Production

Build the application:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## API Endpoints (Planned)

### Videos

- `POST /api/videos` - Create new video
- `GET /api/videos/:id` - Get video status
- `GET /api/videos` - List user videos
- `DELETE /api/videos/:id` - Delete video
- `GET /api/videos/:id/download` - Download video
- `POST /api/videos/:id/remix` - Remix existing video

### Health

- `GET /health` - Health check endpoint
- `GET /` - API information

## Project Structure

```
src/
├── config/          # Configuration files
│   ├── database.ts  # PostgreSQL connection
│   ├── redis.ts     # Redis connection
│   └── openai.ts    # OpenAI client
├── controllers/     # Request handlers
├── services/        # Business logic
├── routes/          # API routes
├── middleware/      # Express middleware
├── models/          # Data models
├── types/           # TypeScript types
├── utils/           # Utility functions
└── app.ts          # Application entry point
```

## Database Schema

See `schema.sql` for complete database schema including:

- `videos` - Video jobs and metadata
- `video_events` - Audit trail for video operations
- `user_quotas` - User usage limits and tracking

## Environment Variables

See `.env.example` for all available configuration options.

## License

ISC

## Status

Day 1 Complete - Project setup and configuration ✅
