export interface VideoJob {
  id: string;
  object: 'video';
  model: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  prompt?: string;
  size?: string;
  seconds?: string;
  quality?: string;
  remixed_from_video_id?: string;
  file_url?: string;
  thumbnail_url?: string;
  created_at: number;
  completed_at?: number;
  expires_at?: number;
  error?: {
    code: string;
    message: string;
  };
}

export interface CreateVideoRequest {
  prompt: string;
  model?: string;
  size?: string;
  seconds?: string;
  quality?: string;
}

export interface RemixVideoRequest {
  prompt: string;
}

export interface VideoListResponse {
  data: VideoJob[];
  object: 'list';
  has_more?: boolean;
  after?: string;
}

export interface WebhookEvent {
  id: string;
  type: 'video.created' | 'video.completed' | 'video.failed';
  data: VideoJob;
  created_at: number;
}

export interface User {
  id: string;
  email?: string;
  [key: string]: any;
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
