# Sora Studio

Full-stack AI video generation platform powered by OpenAI's Sora 2 model.

## Overview

Sora Studio is a complete web application that enables users to create stunning AI-generated videos from text descriptions using OpenAI's Sora 2 API. The platform features a modern Next.js frontend, Node.js/Express backend, PostgreSQL database, and Redis caching.

## Features

- **Video Generation**: Create videos from text prompts using Sora 2 and Sora 2 Pro models
- **Real-time Status Tracking**: Monitor video generation progress in real-time
- **Video Management**: List, view, download, and delete generated videos
- **Video Remixing**: Iterate on existing videos with new prompts
- **User Quotas**: Track and limit usage per user
- **Background Processing**: Asynchronous status polling and video processing
- **Caching**: Redis-based caching for improved performance
- **Type Safety**: Full TypeScript implementation across frontend and backend

## Project Structure

```
sora-studio/
├── sora-video-backend/     # Backend API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── config/         # Database, Redis, OpenAI configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── services/       # Business logic
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Utility functions
│   ├── schema.sql          # Database schema
│   └── package.json
│
├── sora-frontend/          # Frontend Web App (Next.js + React + TypeScript)
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components (to be built)
│   │   ├── lib/api/       # API client
│   │   └── types/         # TypeScript types
│   └── package.json
│
└── sora-implementation-guide/  # Comprehensive documentation
    ├── README.md
    ├── Sora-2-Video-Generation-Complete-Guide.md
    ├── Sora-2-Quick-Reference.md
    ├── Sora-2-Implementation-Roadmap.md
    └── Sora-2-Troubleshooting-Guide.md
```

## Prerequisites

### Required
- Node.js 18+ (LTS recommended)
- PostgreSQL 14+
- OpenAI API key with Sora 2 access

### Optional but Recommended
- Redis 6+ (for caching and improved performance)
- Git for version control

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd sora-studio
```

### 2. Backend Setup

```bash
cd sora-video-backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your credentials:
# - OPENAI_API_KEY
# - DATABASE_URL
# - REDIS_URL (optional)

# Create database schema
psql $DATABASE_URL -f schema.sql

# Test connections
npm run test:connections

# Start development server
npm run dev
```

Backend will be available at `http://localhost:3000`

### 3. Frontend Setup

```bash
cd ../sora-frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.local.example .env.local
# Update NEXT_PUBLIC_API_URL if needed

# Start development server
npm run dev
```

Frontend will be available at `http://localhost:3001`

## Environment Variables

### Backend (.env)

```bash
# OpenAI Configuration
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_ORG_ID=org-your-org-id (optional)
OPENAI_PROJECT_ID=proj_your-project-id (optional)

# Database
DATABASE_URL=postgresql://user:password@host:5432/sora_studio

# Redis (optional but recommended)
REDIS_URL=redis://localhost:6379

# Application
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:3001
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Database Setup

The project uses PostgreSQL for data persistence. Run the schema file to create necessary tables:

```bash
psql $DATABASE_URL -f sora-video-backend/schema.sql
```

Tables created:
- `videos` - Video jobs and metadata
- `video_events` - Audit trail for video operations
- `user_quotas` - User usage tracking and limits

## Development Roadmap

### ✅ Day 1: Project Setup & Configuration (COMPLETE)
- [x] Backend project structure created
- [x] Frontend project structure created
- [x] TypeScript configuration
- [x] Database schema defined
- [x] Environment templates created
- [x] API client configured
- [x] Connection test utilities

### → Day 2: Core API Integration (NEXT)
- [ ] Implement Sora service (video creation, status checking)
- [ ] Create video controller
- [ ] Set up Express routes
- [ ] Add request validation
- [ ] Test video creation endpoint

### Day 3: Database Operations
- [ ] Video service implementation
- [ ] Database CRUD operations
- [ ] User quota system
- [ ] Event logging

### Days 4-14
See `sora-implementation-guide/Sora-2-Implementation-Roadmap.md` for complete 14-day sprint plan.

## API Endpoints (Planned)

### Videos
- `POST /api/videos` - Create new video
- `GET /api/videos/:id` - Get video status
- `GET /api/videos` - List user videos
- `DELETE /api/videos/:id` - Delete video
- `GET /api/videos/:id/download` - Download completed video
- `POST /api/videos/:id/remix` - Remix existing video

### Health
- `GET /health` - Health check endpoint
- `GET /` - API information

## Technology Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **Language**: TypeScript 5
- **Database**: PostgreSQL 14+ (via pg)
- **Cache**: Redis 6+ (via redis)
- **API**: OpenAI SDK
- **Security**: Helmet, CORS

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 3
- **State Management**: React Query (TanStack Query)
- **HTTP Client**: Axios
- **Icons**: Lucide React

## Testing

### Backend Tests

```bash
cd sora-video-backend

# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# Test connections
npm run test:connections
```

### Frontend Tests

```bash
cd sora-frontend

# Run linter
npm run lint
```

## Deployment

### Docker (Recommended)

```bash
# Build and run with docker-compose
docker-compose up --build

# Run in background
docker-compose up -d
```

### Manual Deployment

#### Backend

```bash
cd sora-video-backend
npm run build
npm start
```

#### Frontend

```bash
cd sora-frontend
npm run build
npm start
```

## Documentation

Comprehensive documentation is available in the `sora-implementation-guide/` directory:

- **Complete Guide**: Full technical architecture and implementation details
- **Quick Reference**: Copy-paste code snippets and examples
- **Implementation Roadmap**: 14-day sprint plan with daily tasks
- **Troubleshooting Guide**: Common issues and solutions

## Contributing

This is a personal/team project following a structured implementation roadmap. Refer to the roadmap for current development priorities.

## Cost Estimation

Expected monthly costs for small-medium usage:
- **OpenAI API**: $50-200 (varies with video generation volume)
- **Database (NeonDB)**: $0-25
- **Redis (Upstash)**: $0-10
- **Hosting**: $10-50

Total: **$60-285/month**

## Security Considerations

- API keys stored in environment variables (never in code)
- Server-side API proxying (frontend never exposes OpenAI key)
- Input validation and sanitization
- Rate limiting to prevent abuse
- User quota enforcement
- CORS configuration for frontend access

## License

ISC

## Status

**Current Phase**: Day 1 Complete ✅
**Next Phase**: Day 2 - Core API Integration
**Overall Progress**: 7% (1/14 days)

---

**Last Updated**: October 22, 2025
**Version**: 1.0.0-alpha
