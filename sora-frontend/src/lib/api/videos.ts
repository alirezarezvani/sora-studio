import apiClient from './client';
import { VideoJob, CreateVideoRequest, RemixVideoRequest } from '@/types';

export const videoApi = {
  create: async (data: CreateVideoRequest): Promise<VideoJob> => {
    const response = await apiClient.post('/videos', data);
    return response.data.data;
  },

  remix: async (videoId: string, data: RemixVideoRequest): Promise<VideoJob> => {
    const response = await apiClient.post(`/videos/${videoId}/remix`, data);
    return response.data.data;
  },

  getVideo: async (videoId: string): Promise<VideoJob> => {
    const response = await apiClient.get(`/videos/${videoId}`);
    return response.data.data;
  },

  listVideos: async (limit: number = 20, offset: number = 0): Promise<VideoJob[]> => {
    const response = await apiClient.get(`/videos?limit=${limit}&offset=${offset}`);
    return response.data.data;
  },

  deleteVideo: async (videoId: string): Promise<void> => {
    await apiClient.delete(`/videos/${videoId}`);
  },

  getDownloadUrl: (videoId: string): string => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    return `${baseUrl}/videos/${videoId}/download`;
  },
};
