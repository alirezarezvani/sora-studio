import { Request, Response, NextFunction } from 'express';
import soraService from '../services/sora.service.js';
import videoService from '../services/video.service.js';
import quotaService from '../services/quota.service.js';
import cacheService from '../services/cache.service.js';
import eventService from '../services/event.service.js';
import { CreateVideoRequest, RemixVideoRequest } from '../types/index.js';

/**
 * Create a new video generation job
 * POST /api/videos
 */
export async function createVideo(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const { prompt, model, size, seconds, quality }: CreateVideoRequest = req.body;
    const userId = req.user?.id || 'anonymous'; // Get user ID from auth middleware

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

    // Check user quota before creating video
    const quotaCheck = await quotaService.checkQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: quotaCheck.message || 'Quota exceeded',
        quota: {
          current_usage: quotaCheck.current_usage,
          limit: quotaCheck.limit,
          remaining: quotaCheck.remaining,
        },
      });
    }

    // Create video using Sora service
    const video = await soraService.createVideo(prompt, {
      model,
      size,
      seconds,
      quality,
    });

    // Store video metadata in database
    await videoService.createVideo({
      id: video.id,
      user_id: userId,
      model: video.model,
      status: video.status,
      progress: video.progress,
      prompt,
      size,
      seconds,
      quality,
      metadata: {
        created_via: 'api',
      },
    });

    // Track usage and calculate cost
    const cost = quotaService.calculateCost(video.model, seconds);
    await quotaService.trackUsage(userId, video.id, cost);

    // Cache the video
    await cacheService.cacheVideo(video);

    // Log event
    await eventService.logVideoCreated(video.id, userId, video.model, prompt);

    console.log(`[VideoController] Video created successfully: ${video.id} for user ${userId}`);

    res.status(201).json({
      success: true,
      data: video,
      quota: {
        current_usage: quotaCheck.current_usage + 1,
        limit: quotaCheck.limit,
        remaining: quotaCheck.remaining - 1,
      },
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

    // Try cache first
    let video = await cacheService.getCachedVideo(id);

    if (video) {
      console.log(`[VideoController] Returning cached video: ${id}`);
      return res.status(200).json({
        success: true,
        data: video,
        cached: true,
      });
    }

    // Try database next
    video = await videoService.getVideoById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    // If video is still in progress, update from OpenAI
    if (video.status === 'queued' || video.status === 'in_progress') {
      try {
        const liveVideo = await soraService.getVideoStatus(id);

        // Update database if status changed
        if (liveVideo.status !== video.status) {
          await videoService.updateVideoStatus(id, liveVideo.status, {
            progress: liveVideo.progress,
            file_url: liveVideo.file_url,
            thumbnail_url: liveVideo.thumbnail_url,
            completed_at: liveVideo.completed_at ? new Date(liveVideo.completed_at * 1000) : undefined,
            expires_at: liveVideo.expires_at ? new Date(liveVideo.expires_at * 1000) : undefined,
            error_message: liveVideo.error?.message,
          });

          // Log status change event
          await eventService.logStatusChanged(id, video.status, liveVideo.status);

          video = liveVideo;
        } else {
          video = liveVideo;
        }
      } catch (error: any) {
        console.error('[VideoController] Error updating video status from OpenAI:', error.message);
        // Continue with database version
      }
    }

    // Cache the video
    await cacheService.cacheVideo(video);

    res.status(200).json({
      success: true,
      data: video,
      cached: false,
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
    const userId = req.user?.id || 'anonymous';
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string | undefined;

    // Parse date filters if provided
    let fromDate: Date | undefined;
    let toDate: Date | undefined;

    if (req.query.from_date) {
      fromDate = new Date(req.query.from_date as string);
    }

    if (req.query.to_date) {
      toDate = new Date(req.query.to_date as string);
    }

    // Fetch videos from database (not from OpenAI API)
    const videos = await videoService.getVideosByUser(userId, {
      status,
      from_date: fromDate,
      to_date: toDate,
      limit,
      offset,
    });

    res.status(200).json({
      success: true,
      data: videos,
      pagination: {
        limit,
        offset,
        count: videos.length,
        has_more: videos.length === limit,
      },
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
    const userId = req.user?.id || 'anonymous';

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Video ID is required',
      });
    }

    // Soft delete in database
    const deleted = await videoService.deleteVideo(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Video not found',
      });
    }

    // Invalidate cache
    await cacheService.invalidateVideo(id);

    // Log deletion event
    await eventService.logVideoDeleted(id, userId);

    // Optionally delete from OpenAI (commented out for now - keeps original)
    // try {
    //   await soraService.deleteVideo(id);
    // } catch (error) {
    //   console.error('[VideoController] Failed to delete from OpenAI (non-critical):', error);
    // }

    res.status(200).json({
      success: true,
      data: {
        id,
        deleted: true,
      },
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

    // Log download event
    const ipAddress = req.ip || req.socket.remoteAddress;
    const userAgent = req.get('user-agent');
    await eventService.logVideoDownloaded(id, ipAddress, userAgent);

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
    const userId = req.user?.id || 'anonymous';

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

    // Check quota before remixing
    const quotaCheck = await quotaService.checkQuota(userId);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        success: false,
        error: quotaCheck.message || 'Quota exceeded',
        quota: {
          current_usage: quotaCheck.current_usage,
          limit: quotaCheck.limit,
          remaining: quotaCheck.remaining,
        },
      });
    }

    // Create remixed video
    const remixedVideo = await soraService.remixVideo(id, prompt);

    // Store remixed video in database
    await videoService.createVideo({
      id: remixedVideo.id,
      user_id: userId,
      model: remixedVideo.model,
      status: remixedVideo.status,
      progress: remixedVideo.progress,
      prompt,
      remixed_from_video_id: id,
      metadata: {
        created_via: 'remix',
        source_video_id: id,
      },
    });

    // Track usage
    const cost = quotaService.calculateCost(remixedVideo.model, '5'); // Default duration
    await quotaService.trackUsage(userId, remixedVideo.id, cost);

    // Cache the new video
    await cacheService.cacheVideo(remixedVideo);

    // Log remix event
    await eventService.logVideoRemixed(remixedVideo.id, id, prompt);

    res.status(201).json({
      success: true,
      data: remixedVideo,
      quota: {
        current_usage: quotaCheck.current_usage + 1,
        limit: quotaCheck.limit,
        remaining: quotaCheck.remaining - 1,
      },
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
