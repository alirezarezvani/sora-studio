import { Request, Response, NextFunction } from 'express';
import soraService from '../services/sora.service.js';
import { CreateVideoRequest, RemixVideoRequest } from '../types/index.js';

/**
 * Create a new video generation job
 * POST /api/videos
 */
export async function createVideo(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const { prompt, model, size, seconds, quality }: CreateVideoRequest = req.body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required and must be a non-empty string',
      });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is too long (maximum 1000 characters)',
      });
    }

    // Validate model if provided
    if (model && !['sora-2', 'sora-2-pro'].includes(model)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid model. Must be "sora-2" or "sora-2-pro"',
      });
    }

    // Create video using Sora service
    const video = await soraService.createVideo(prompt, {
      model,
      size,
      seconds,
      quality,
    });

    res.status(201).json({
      success: true,
      data: video,
    });
  } catch (error: any) {
    console.error('[VideoController] Error creating video:', error.message);
    next(error);
  }
}

/**
 * Get video status and metadata
 * GET /api/videos/:id
 */
export async function getVideo(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Video ID is required',
      });
    }

    const video = await soraService.getVideoStatus(id);

    res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error: any) {
    console.error('[VideoController] Error getting video:', error.message);

    // Handle 404 specifically
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    next(error);
  }
}

/**
 * List videos with pagination
 * GET /api/videos
 */
export async function listVideos(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const after = req.query.after as string | undefined;

    const videos = await soraService.listVideos(limit, after);

    res.status(200).json({
      success: true,
      data: videos.data,
      has_more: videos.has_more,
      ...(videos.after && { after: videos.after }),
    });
  } catch (error: any) {
    console.error('[VideoController] Error listing videos:', error.message);
    next(error);
  }
}

/**
 * Delete a video
 * DELETE /api/videos/:id
 */
export async function deleteVideo(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Video ID is required',
      });
    }

    const result = await soraService.deleteVideo(id);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('[VideoController] Error deleting video:', error.message);

    // Handle 404 specifically
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    next(error);
  }
}

/**
 * Download video content
 * GET /api/videos/:id/download
 */
export async function downloadVideo(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Video ID is required',
      });
    }

    // Download video buffer
    const videoBuffer = await soraService.downloadVideo(id);

    // Set headers for video download
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="video_${id}.mp4"`);
    res.setHeader('Content-Length', videoBuffer.length);

    res.status(200).send(videoBuffer);
  } catch (error: any) {
    console.error('[VideoController] Error downloading video:', error.message);

    // Handle specific errors
    if (error.message.includes('not completed')) {
      return res.status(400).json({
        success: false,
        error: 'Video is not ready for download yet',
      });
    }

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    next(error);
  }
}

/**
 * Remix an existing video
 * POST /api/videos/:id/remix
 */
export async function remixVideo(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const { id } = req.params;
    const { prompt }: RemixVideoRequest = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Video ID is required',
      });
    }

    // Validate remix prompt
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Remix prompt is required and must be a non-empty string',
      });
    }

    if (prompt.length > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Remix prompt is too long (maximum 1000 characters)',
      });
    }

    const remixedVideo = await soraService.remixVideo(id, prompt);

    res.status(201).json({
      success: true,
      data: remixedVideo,
    });
  } catch (error: any) {
    console.error('[VideoController] Error remixing video:', error.message);

    // Handle specific errors
    if (error.message.includes('not completed')) {
      return res.status(400).json({
        success: false,
        error: 'Source video must be completed before remixing',
      });
    }

    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: 'Source video not found',
      });
    }

    next(error);
  }
}
