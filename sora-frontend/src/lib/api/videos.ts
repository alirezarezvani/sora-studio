import apiClient from './client';
import { VideoJob, CreateVideoRequest, RemixVideoRequest } from '@/types';
import { mockVideoApi } from '../mock/mockApi';

// Check if mock mode is enabled
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true';

export const videoApi = {
  create: async (data: CreateVideoRequest): Promise<VideoJob> => {
    if (MOCK_MODE) {
      return mockVideoApi.create(data);
    }
    const response = await apiClient.post('/videos', data);
    return response.data.data;
  },

  remix: async (videoId: string, data: RemixVideoRequest): Promise<VideoJob> => {
    if (MOCK_MODE) {
      return mockVideoApi.remix(videoId, data);
    }
    const response = await apiClient.post(`/videos/${videoId}/remix`, data);
    return response.data.data;
  },

  getVideo: async (videoId: string): Promise<VideoJob> => {
    if (MOCK_MODE) {
      return mockVideoApi.get(videoId);
    }
    const response = await apiClient.get(`/videos/${videoId}`);
    return response.data.data;
  },

  listVideos: async (limit: number = 20, offset: number = 0): Promise<VideoJob[]> => {
    if (MOCK_MODE) {
      return mockVideoApi.list();
    }
    const response = await apiClient.get(`/videos?limit=${limit}&offset=${offset}`);
    return response.data.data;
  },

  deleteVideo: async (videoId: string): Promise<void> => {
    if (MOCK_MODE) {
      return mockVideoApi.delete(videoId);
    }
    await apiClient.delete(`/videos/${videoId}`);
  },

  getDownloadUrl: (videoId: string): string => {
    if (MOCK_MODE) {
      return mockVideoApi.getDownloadUrl(videoId);
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    return `${baseUrl}/videos/${videoId}/download`;
  },
};
