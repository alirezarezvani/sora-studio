import openai from '../config/openai.js';
import { VideoJob, VideoListResponse } from '../types/index.js';

export interface VideoOptions {
  model?: string;
  size?: string;
  seconds?: string;
  quality?: string;
}

class SoraService {
  /**
   * Create a new video generation job
   * @param prompt - Video description prompt
   * @param options - Optional video generation parameters
   * @returns VideoJob object with initial status
   */
  async createVideo(prompt: string, options?: VideoOptions): Promise<VideoJob> {
    try {
      console.log(`[SoraService] Creating video with prompt: "${prompt.substring(0, 50)}..."`);
      console.log(`[SoraService] Options:`, options);

      // Note: TypeScript types may not be up-to-date with videos API
      // Using type assertion to access the videos endpoint
      const video = await (openai as any).videos.create({
        model: options?.model || 'sora-2',
        prompt,
        ...(options?.size && { size: options.size }),
        ...(options?.seconds && { seconds: options.seconds }),
        ...(options?.quality && { quality: options.quality }),
      });

      console.log(`[SoraService] Video created successfully: ${video.id}, status: ${video.status}`);
      return video as VideoJob;
    } catch (error: any) {
      console.error(`[SoraService] Error creating video:`, error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Get video status and metadata
   * @param videoId - ID of the video to retrieve
   * @returns VideoJob object with current status
   */
  async getVideoStatus(videoId: string): Promise<VideoJob> {
    try {
      console.log(`[SoraService] Retrieving status for video: ${videoId}`);

      const video = await (openai as any).videos.retrieve(videoId);

      console.log(`[SoraService] Video ${videoId} status: ${video.status}, progress: ${video.progress}%`);
      return video as VideoJob;
    } catch (error: any) {
      console.error(`[SoraService] Error getting video status for ${videoId}:`, error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Download completed video content
   * @param videoId - ID of the video to download
   * @returns Buffer containing video file data
   */
  async downloadVideo(videoId: string): Promise<Buffer> {
    try {
      console.log(`[SoraService] Downloading video content: ${videoId}`);

      // First check if video is completed
      const video = await this.getVideoStatus(videoId);

      if (video.status !== 'completed') {
        throw new Error(`Video ${videoId} is not completed yet. Current status: ${video.status}`);
      }

      // Download video content
      const response = await (openai as any).videos.downloadContent(videoId);
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      console.log(`[SoraService] Video ${videoId} downloaded successfully. Size: ${buffer.length} bytes`);
      return buffer;
    } catch (error: any) {
      console.error(`[SoraService] Error downloading video ${videoId}:`, error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Remix an existing video with a new prompt
   * @param videoId - ID of the video to remix
   * @param newPrompt - New prompt for remixing
   * @returns VideoJob object for the new remixed video
   */
  async remixVideo(videoId: string, newPrompt: string): Promise<VideoJob> {
    try {
      console.log(`[SoraService] Remixing video ${videoId} with prompt: "${newPrompt.substring(0, 50)}..."`);

      // First verify the source video exists and is completed
      const sourceVideo = await this.getVideoStatus(videoId);

      if (sourceVideo.status !== 'completed') {
        throw new Error(`Source video ${videoId} must be completed before remixing. Current status: ${sourceVideo.status}`);
      }

      const remixedVideo = await (openai as any).videos.remix(videoId, {
        prompt: newPrompt,
      });

      console.log(`[SoraService] Remix created successfully: ${remixedVideo.id}, remixed from: ${videoId}`);
      return remixedVideo as VideoJob;
    } catch (error: any) {
      console.error(`[SoraService] Error remixing video ${videoId}:`, error.message);
      throw this.handleError(error);
    }
  }

  /**
   * List videos with pagination
   * @param limit - Number of videos to retrieve (max 100)
   * @param after - Cursor for pagination
   * @returns VideoListResponse with array of videos
   */
  async listVideos(limit: number = 20, after?: string): Promise<VideoListResponse> {
    try {
      console.log(`[SoraService] Listing videos: limit=${limit}, after=${after || 'none'}`);

      const response = await (openai as any).videos.list({
        limit,
        ...(after && { after }),
      });

      console.log(`[SoraService] Retrieved ${response.data.length} videos`);
      return response as VideoListResponse;
    } catch (error: any) {
      console.error(`[SoraService] Error listing videos:`, error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Delete a video
   * @param videoId - ID of the video to delete
   * @returns Deletion confirmation
   */
  async deleteVideo(videoId: string): Promise<{ id: string; deleted: boolean }> {
    try {
      console.log(`[SoraService] Deleting video: ${videoId}`);

      const result = await (openai as any).videos.delete(videoId);

      console.log(`[SoraService] Video ${videoId} deleted successfully`);
      return result as { id: string; deleted: boolean };
    } catch (error: any) {
      console.error(`[SoraService] Error deleting video ${videoId}:`, error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Wait for video completion with polling
   * @param videoId - ID of the video to monitor
   * @param onProgress - Callback for progress updates
   * @param timeoutMs - Maximum time to wait in milliseconds
   * @returns Completed VideoJob
   */
  async waitForCompletion(
    videoId: string,
    onProgress?: (progress: number, status: string) => void,
    timeoutMs: number = 300000 // 5 minutes default
  ): Promise<VideoJob> {
    const startTime = Date.now();
    const pollInterval = 10000; // 10 seconds

    console.log(`[SoraService] Waiting for video ${videoId} to complete (timeout: ${timeoutMs}ms)`);

    while (Date.now() - startTime < timeoutMs) {
      const video = await this.getVideoStatus(videoId);

      if (onProgress) {
        onProgress(video.progress, video.status);
      }

      if (video.status === 'completed') {
        console.log(`[SoraService] Video ${videoId} completed successfully`);
        return video;
      }

      if (video.status === 'failed') {
        const errorMsg = video.error?.message || 'Video generation failed';
        console.error(`[SoraService] Video ${videoId} failed: ${errorMsg}`);
        throw new Error(errorMsg);
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Timeout waiting for video ${videoId} completion`);
  }

  /**
   * Handle and normalize errors from OpenAI API
   * @param error - Original error object
   * @returns Normalized error
   */
  private handleError(error: any): Error {
    // OpenAI API errors
    if (error.status) {
      switch (error.status) {
        case 400:
          return new Error(`Invalid request: ${error.message || 'Bad request'}`);
        case 401:
          return new Error('Authentication failed. Check your API key.');
        case 403:
          return new Error('Access forbidden. Check your permissions.');
        case 404:
          return new Error('Video not found or has been deleted.');
        case 429:
          return new Error('Rate limit exceeded. Please try again later.');
        case 500:
        case 502:
        case 503:
          return new Error('OpenAI service error. Please try again later.');
        default:
          return new Error(`API error (${error.status}): ${error.message}`);
      }
    }

    // Network or other errors
    if (error.code === 'ECONNREFUSED') {
      return new Error('Cannot connect to OpenAI API. Check your network connection.');
    }

    if (error.code === 'ETIMEDOUT') {
      return new Error('Request to OpenAI API timed out. Please try again.');
    }

    // Return original error if not recognized
    return error;
  }
}

export default new SoraService();
