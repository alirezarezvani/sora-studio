import { VideoJob, CreateVideoRequest } from '@/types';

/**
 * Generate a mock video job
 */
export const generateMockVideo = (request: CreateVideoRequest): VideoJob => {
  const id = `mock_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const now = Math.floor(Date.now() / 1000);

  return {
    id,
    object: 'video',
    model: request.model || 'sora-2',
    status: 'queued',
    progress: 0,
    prompt: request.prompt,
    size: request.size || '720p',
    seconds: request.seconds || '4',
    quality: request.quality,
    created_at: now,
  };
};

/**
 * Simulate video status progression
 * queued (2s) → in_progress (5s) → completed
 */
export const simulateVideoProgress = (video: VideoJob): Promise<VideoJob> => {
  return new Promise((resolve) => {
    if (video.status === 'queued') {
      // After 2 seconds, move to in_progress
      setTimeout(() => {
        resolve({
          ...video,
          status: 'in_progress',
          progress: 30,
        });
      }, 2000);
    } else if (video.status === 'in_progress') {
      // After 5 seconds, move to completed
      setTimeout(() => {
        resolve({
          ...video,
          status: 'completed',
          progress: 100,
          completed_at: Math.floor(Date.now() / 1000),
          file_url: `https://mock-storage.example.com/videos/${video.id}.mp4`,
          thumbnail_url: `https://via.placeholder.com/1280x720/10b981/ffffff?text=Mock+Video`,
        });
      }, 5000);
    } else {
      // Already completed or failed
      resolve(video);
    }
  });
};

/**
 * Generate sample mock videos for initial gallery
 */
export const getSampleMockVideos = (): VideoJob[] => {
  const now = Math.floor(Date.now() / 1000);

  return [
    {
      id: 'mock_sample_1',
      object: 'video',
      model: 'sora-2',
      status: 'completed',
      progress: 100,
      prompt: 'Wide shot of a child flying a red kite in a grassy park, golden hour sunlight, camera slowly pans upward.',
      size: '720p',
      seconds: '4',
      created_at: now - 3600,
      completed_at: now - 3300,
      file_url: 'https://mock-storage.example.com/videos/mock_sample_1.mp4',
      thumbnail_url: 'https://via.placeholder.com/1280x720/10b981/ffffff?text=Sample+Video+1',
    },
    {
      id: 'mock_sample_2',
      object: 'video',
      model: 'sora-2-pro',
      status: 'completed',
      progress: 100,
      prompt: 'Close-up of a coffee cup steaming on a wooden table, morning light streaming through window.',
      size: '1080p',
      seconds: '8',
      created_at: now - 7200,
      completed_at: now - 6800,
      file_url: 'https://mock-storage.example.com/videos/mock_sample_2.mp4',
      thumbnail_url: 'https://via.placeholder.com/1920x1080/059669/ffffff?text=Sample+Video+2',
    },
    {
      id: 'mock_sample_3',
      object: 'video',
      model: 'sora-2',
      status: 'in_progress',
      progress: 65,
      prompt: 'Drone shot flying over a misty mountain range at sunrise, dramatic clouds.',
      size: '720p',
      seconds: '12',
      created_at: now - 300,
    },
  ];
};

/**
 * Simulate network delay
 */
export const simulateNetworkDelay = (minMs: number = 300, maxMs: number = 800): Promise<void> => {
  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, delay));
};
