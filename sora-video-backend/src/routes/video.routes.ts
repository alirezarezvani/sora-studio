import { Router } from 'express';
import {
  createVideo,
  getVideo,
  listVideos,
  deleteVideo,
  downloadVideo,
  remixVideo,
} from '../controllers/video.controller.js';
import { videoCreationLimiter } from '../middleware/rateLimit.js';

const router = Router();

/**
 * Video API Routes
 * Base path: /api/videos
 */

// Create a new video generation job (with strict rate limiting)
router.post('/', videoCreationLimiter, createVideo);

// List all videos (with pagination)
router.get('/', listVideos);

// Download video content (MUST be before /:id to avoid route collision)
router.get('/:id/download', downloadVideo);

// Remix an existing video (with strict rate limiting)
router.post('/:id/remix', videoCreationLimiter, remixVideo);

// Get specific video status (MUST be after specific routes like /download)
router.get('/:id', getVideo);

// Delete a video
router.delete('/:id', deleteVideo);

export default router;
