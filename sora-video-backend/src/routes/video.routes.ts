import { Router } from 'express';
import {
  createVideo,
  getVideo,
  listVideos,
  deleteVideo,
  downloadVideo,
  remixVideo,
} from '../controllers/video.controller.js';

const router = Router();

/**
 * Video API Routes
 * Base path: /api/videos
 */

// Create a new video generation job
router.post('/', createVideo);

// List all videos (with pagination)
router.get('/', listVideos);

// Get specific video status
router.get('/:id', getVideo);

// Delete a video
router.delete('/:id', deleteVideo);

// Download video content
router.get('/:id/download', downloadVideo);

// Remix an existing video
router.post('/:id/remix', remixVideo);

export default router;
