import { VideoJob, CreateVideoRequest, RemixVideoRequest } from '@/types';
import {
  generateMockVideo,
  simulateVideoProgress,
  getSampleMockVideos,
  simulateNetworkDelay,
} from './mockData';

/**
 * In-memory storage for mock videos
 */
class MockVideoStore {
  private videos: Map<string, VideoJob> = new Map();
  private progressTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // Initialize with sample videos
    const samples = getSampleMockVideos();
    samples.forEach((video) => this.videos.set(video.id, video));
  }

  async create(request: CreateVideoRequest): Promise<VideoJob> {
    await simulateNetworkDelay(400, 700);

    const video = generateMockVideo(request);
    this.videos.set(video.id, video);

    // Start automatic status progression
    this.startProgressSimulation(video.id);

    return video;
  }

  async get(id: string): Promise<VideoJob> {
    await simulateNetworkDelay(100, 300);

    const video = this.videos.get(id);
    if (!video) {
      throw new Error(`Video ${id} not found`);
    }

    return video;
  }

  async list(): Promise<VideoJob[]> {
    await simulateNetworkDelay(200, 500);

    return Array.from(this.videos.values()).sort(
      (a, b) => b.created_at - a.created_at
    );
  }

  async delete(id: string): Promise<void> {
    await simulateNetworkDelay(200, 400);

    // Clear any progress timers
    const timer = this.progressTimers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.progressTimers.delete(id);
    }

    this.videos.delete(id);
  }

  async remix(videoId: string, request: RemixVideoRequest): Promise<VideoJob> {
    await simulateNetworkDelay(400, 700);

    const originalVideo = this.videos.get(videoId);
    if (!originalVideo) {
      throw new Error(`Original video ${videoId} not found`);
    }

    const remixedVideo = generateMockVideo({
      prompt: request.prompt,
      model: originalVideo.model,
      size: originalVideo.size,
      seconds: originalVideo.seconds,
    });

    remixedVideo.remixed_from_video_id = videoId;
    this.videos.set(remixedVideo.id, remixedVideo);

    // Start automatic status progression
    this.startProgressSimulation(remixedVideo.id);

    return remixedVideo;
  }

  /**
   * Automatically progress video through statuses
   */
  private startProgressSimulation(videoId: string) {
    // Move from queued to in_progress after 2 seconds
    const queuedTimer = setTimeout(async () => {
      const video = this.videos.get(videoId);
      if (video && video.status === 'queued') {
        const updatedVideo: VideoJob = {
          ...video,
          status: 'in_progress',
          progress: 30,
        };
        this.videos.set(videoId, updatedVideo);

        // Move to completed after another 5 seconds
        const progressTimer = setTimeout(() => {
          const currentVideo = this.videos.get(videoId);
          if (currentVideo && currentVideo.status === 'in_progress') {
            const completedVideo: VideoJob = {
              ...currentVideo,
              status: 'completed',
              progress: 100,
              completed_at: Math.floor(Date.now() / 1000),
              file_url: `https://mock-storage.example.com/videos/${videoId}.mp4`,
              thumbnail_url: `https://via.placeholder.com/1280x720/10b981/ffffff?text=Mock+Video`,
            };
            this.videos.set(videoId, completedVideo);
            this.progressTimers.delete(videoId);
          }
        }, 5000);

        this.progressTimers.set(videoId, progressTimer);
      }
    }, 2000);

    this.progressTimers.set(videoId, queuedTimer);
  }

  /**
   * Clear all timers (cleanup)
   */
  cleanup() {
    this.progressTimers.forEach((timer) => clearTimeout(timer));
    this.progressTimers.clear();
  }
}

// Singleton instance
const mockStore = new MockVideoStore();

/**
 * Mock API that simulates backend responses
 */
export const mockVideoApi = {
  create: (request: CreateVideoRequest) => mockStore.create(request),
  get: (id: string) => mockStore.get(id),
  list: () => mockStore.list(),
  delete: (id: string) => mockStore.delete(id),
  remix: (videoId: string, request: RemixVideoRequest) => mockStore.remix(videoId, request),
  getDownloadUrl: (videoId: string) => `https://mock-storage.example.com/videos/${videoId}.mp4`,
};

// Cleanup on module unload (for development hot reload)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    mockStore.cleanup();
  });
}
