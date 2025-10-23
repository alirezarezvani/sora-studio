import axios, { AxiosError } from 'axios';
import { VideoJob, VideoListResponse } from '../types/index.js';

export interface VideoOptions {
  model?: string;
  size?: string;
  seconds?: string;
  quality?: string;
}

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_ORG_ID = process.env.OPENAI_ORG_ID;
const OPENAI_PROJECT_ID = process.env.OPENAI_PROJECT_ID;
const OPENAI_BASE_URL = 'https://api.openai.com/v1';

// Create axios instance with OpenAI configuration
const openaiApi = axios.create({
  baseURL: OPENAI_BASE_URL,
  headers: {
    'Authorization': `Bearer ${OPENAI_API_KEY}`,
    'Content-Type': 'application/json',
    ...(OPENAI_ORG_ID && { 'OpenAI-Organization': OPENAI_ORG_ID }),
    ...(OPENAI_PROJECT_ID && { 'OpenAI-Project': OPENAI_PROJECT_ID }),
  },
  timeout: 30000, // 30 second timeout
});

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

      const response = await openaiApi.post('/videos', {
        model: options?.model || 'sora-2',
        prompt,
        ...(options?.size && { size: options.size }),
        ...(options?.seconds && { seconds: options.seconds }),
        ...(options?.quality && { quality: options.quality }),
      });

      const video = response.data;
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

      const response = await openaiApi.get(`/videos/${videoId}`);
      const video = response.data;

      console.log(`[SoraService] Video status: ${video.id} - ${video.status}`);
      return video as VideoJob;
    } catch (error: any) {
      console.error(`[SoraService] Error retrieving video status:`, error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Download video content
   * @param videoId - ID of the video to download
   * @returns Video content URL (valid for 1 hour)
   */
  async downloadVideo(videoId: string): Promise<{ url: string; expiresAt: string }> {
    try {
      console.log(`[SoraService] Downloading video: ${videoId}`);

      const response = await openaiApi.get(`/videos/${videoId}/content`);

      // The response contains the video URL
      const videoUrl = response.data.url || response.data.download_url;
      const expiresAt = new Date(Date.now() + 3600000).toISOString(); // 1 hour from now

      console.log(`[SoraService] Video download URL retrieved for: ${videoId}`);
      return {
        url: videoUrl,
        expiresAt,
      };
    } catch (error: any) {
      console.error(`[SoraService] Error downloading video:`, error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Remix an existing video with a new prompt
   * @param videoId - ID of the video to remix
   * @param newPrompt - New prompt for remixing
   * @param options - Optional video generation parameters
   * @returns New VideoJob object
   */
  async remixVideo(
    videoId: string,
    newPrompt: string,
    options?: VideoOptions
  ): Promise<VideoJob> {
    try {
      console.log(`[SoraService] Remixing video ${videoId} with prompt: "${newPrompt.substring(0, 50)}..."`);

      const response = await openaiApi.post('/videos', {
        model: options?.model || 'sora-2',
        prompt: newPrompt,
        reference_video_id: videoId,
        ...(options?.size && { size: options.size }),
        ...(options?.seconds && { seconds: options.seconds }),
        ...(options?.quality && { quality: options.quality }),
      });

      const video = response.data;
      console.log(`[SoraService] Remix video created: ${video.id}`);
      return video as VideoJob;
    } catch (error: any) {
      console.error(`[SoraService] Error remixing video:`, error.message);
      throw this.handleError(error);
    }
  }

  /**
   * List videos
   * @param limit - Maximum number of videos to return
   * @returns List of video jobs
   */
  async listVideos(limit: number = 20): Promise<VideoListResponse> {
    try {
      console.log(`[SoraService] Listing videos (limit: ${limit})`);

      const response = await openaiApi.get('/videos', {
        params: { limit },
      });

      console.log(`[SoraService] Found ${response.data.data?.length || 0} videos`);
      return response.data as VideoListResponse;
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

      const response = await openaiApi.delete(`/videos/${videoId}`);

      console.log(`[SoraService] Video deleted: ${videoId}`);
      return response.data;
    } catch (error: any) {
      console.error(`[SoraService] Error deleting video:`, error.message);
      throw this.handleError(error);
    }
  }

  /**
   * Wait for video completion with polling
   * @param videoId - ID of the video to wait for
   * @param maxAttempts - Maximum number of polling attempts
   * @param pollInterval - Interval between polls in milliseconds
   * @returns Completed VideoJob
   */
  async waitForCompletion(
    videoId: string,
    maxAttempts: number = 60,
    pollInterval: number = 10000
  ): Promise<VideoJob> {
    console.log(`[SoraService] Waiting for video ${videoId} to complete...`);

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const video = await this.getVideoStatus(videoId);

      if (video.status === 'completed') {
        console.log(`[SoraService] Video ${videoId} completed after ${attempt} attempts`);
        return video;
      }

      if (video.status === 'failed') {
        throw new Error(`Video generation failed: ${video.error || 'Unknown error'}`);
      }

      console.log(`[SoraService] Video ${videoId} status: ${video.status} (attempt ${attempt}/${maxAttempts})`);

      // Wait before next poll
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }

    throw new Error(`Video generation timeout: exceeded ${maxAttempts} attempts`);
  }

  /**
   * Handle and format errors from OpenAI API
   * @param error - Error from API call
   * @returns Formatted error
   */
  private handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      const status = axiosError.response?.status;
      const data = axiosError.response?.data as any;

      const message = data?.error?.message || axiosError.message || 'Unknown error';
      const errorType = data?.error?.type || 'api_error';

      console.error(`[SoraService] OpenAI API Error (${status}):`, message);

      // Create a more informative error
      const apiError = new Error(`OpenAI API Error: ${message}`);
      (apiError as any).status = status;
      (apiError as any).type = errorType;
      (apiError as any).originalError = data;

      return apiError;
    }

    return error;
  }
}

// Export singleton instance
export default new SoraService();
