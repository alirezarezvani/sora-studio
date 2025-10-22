# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Purpose

This is a **planning and documentation repository** for a Sora 2 video generation web application. No implementation exists yet - only comprehensive implementation guides and API documentation.

## Current Status

**Phase:** Planning and documentation complete, implementation not started
**Type:** GREENFIELD_NEW project (planned)

## What This Repository Contains

### Core Documentation (sora-implementation-guide/)

1. **[README.md](sora-implementation-guide/README.md)** - Navigation hub for all documentation
2. **[Sora-2-Video-Generation-Complete-Guide.md](sora-implementation-guide/Sora-2-Video-Generation-Complete-Guide.md)** - Complete technical architecture, backend/frontend implementation details, deployment guides
3. **[Sora-2-Quick-Reference.md](sora-implementation-guide/Sora-2-Quick-Reference.md)** - Ready-to-use code snippets and API examples
4. **[Sora-2-Implementation-Roadmap.md](sora-implementation-guide/Sora-2-Implementation-Roadmap.md)** - 14-day sprint plan with daily tasks and deliverables
5. **[Sora-2-Troubleshooting-Guide.md](sora-implementation-guide/Sora-2-Troubleshooting-Guide.md)** - Common issues, solutions, and FAQ

### API Reference

**[sora2-api-instructions.md](sora2-api-instructions.md)** - Official OpenAI Sora 2 API documentation covering:
- Video generation workflow (create → poll status → download)
- Two model variants: `sora-2` (fast) and `sora-2-pro` (high quality)
- Image references, video remixing, and content restrictions
- Webhook integration for async notifications

### Other Files

**[prompt-instruction.md](prompt-instruction.md)** - Unrelated to this project (generic custom GPT setup template)

## Planned Application Architecture

When implemented, this will be a full-stack video generation platform:

**Backend (Node.js/Express/TypeScript):**
- RESTful API for video operations (create, status, download, remix, list, delete)
- OpenAI SDK integration for Sora 2 API
- PostgreSQL database (users, videos, jobs, quotas)
- Redis for caching and job queues
- Background workers for status polling and downloads
- Optional webhook handler for OpenAI events

**Frontend (Next.js/React/TypeScript):**
- Video creation interface with prompt builder
- Real-time status tracking and progress visualization
- Video gallery with filtering and search
- User management and quota tracking
- Download and remix capabilities

**Infrastructure:**
- Docker containerization
- S3/Cloudflare R2 for video storage
- GitHub Actions for CI/CD
- Monitoring with Winston/Sentry

## Key Technical Concepts

### Sora 2 API Workflow
Video generation is **asynchronous**:
1. `POST /videos` with prompt → Returns job ID and initial status
2. Poll `GET /videos/{video_id}` → Status: `queued` → `in_progress` → `completed`/`failed`
3. `GET /videos/{video_id}/content` → Download MP4 (URL valid for 1 hour)

### Model Selection
- **sora-2**: Faster, cheaper (~$0.50/5sec), good for iteration and prototyping
- **sora-2-pro**: Slower, expensive (~$2.00/10sec), production quality

### Content Restrictions
- No faces of real people
- No copyrighted characters or music
- Content must be suitable for under-18 audiences

### Prompting Best Practices
Specify: shot type, subject, action, setting, lighting
Example: "Wide shot of a child flying a red kite in a grassy park, golden hour sunlight, camera slowly pans upward."

## Implementation Guidance

### Starting Development

Follow the **14-day roadmap** in [Sora-2-Implementation-Roadmap.md](sora-implementation-guide/Sora-2-Implementation-Roadmap.md):

**Week 1:**
- Days 1-2: Project setup, core API integration, test video generation
- Day 3: Database schema and operations
- Days 4-5: Frontend dashboard and status polling

**Week 2:**
- Days 6-7: Download, remix, and gallery features
- Days 8-9: Authentication and user management
- Days 10-11: Rate limiting, quotas, monitoring
- Days 12-14: Testing, optimization, deployment

### Code Reference Sources

When implementing features, use:
- **Architecture patterns** → [Sora-2-Video-Generation-Complete-Guide.md](sora-implementation-guide/Sora-2-Video-Generation-Complete-Guide.md)
- **Copy-paste snippets** → [Sora-2-Quick-Reference.md](sora-implementation-guide/Sora-2-Quick-Reference.md)
- **API details** → [sora2-api-instructions.md](sora2-api-instructions.md)
- **Troubleshooting** → [Sora-2-Troubleshooting-Guide.md](sora-implementation-guide/Sora-2-Troubleshooting-Guide.md)

## Important Considerations

### Performance
- Video generation takes several minutes - use background workers, not blocking requests
- Implement exponential backoff for status polling (poll every 10-20 seconds)
- Use Redis caching for video metadata
- Download URLs expire after 1 hour - copy to persistent storage immediately

### Cost Management
- Implement user quotas from day 1
- Track costs per user/organization
- Consider implementing approval workflows for expensive `sora-2-pro` requests
- Expected monthly costs: $51-290 for small-medium usage (includes OpenAI + infrastructure)

### Security
- Never expose OpenAI API key to frontend
- Validate all user inputs (prompts, reference images)
- Implement rate limiting to prevent abuse
- Use webhook secrets to verify OpenAI webhook authenticity

## When Implementation Begins

After initializing the project structure, update this CLAUDE.md with:
- Actual file structure and key directories
- Real development commands (npm scripts, test commands)
- Database migration commands
- Docker commands
- Any architectural decisions that differ from the documentation
