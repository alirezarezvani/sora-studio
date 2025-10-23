import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { videoApi } from '@/lib/api/videos';
import { CreateVideoRequest, VideoJob } from '@/types';

export const useVideos = (limit: number = 20, offset: number = 0) => {
  return useQuery<VideoJob[]>({
    queryKey: ['videos', limit, offset],
    queryFn: () => videoApi.listVideos(limit, offset),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useVideo = (videoId: string) => {
  return useQuery<VideoJob>({
    queryKey: ['video', videoId],
    queryFn: () => videoApi.getVideo(videoId),
    enabled: !!videoId,
  });
};

export const useCreateVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateVideoRequest) => videoApi.create(data),
    onSuccess: () => {
      // Invalidate and refetch videos list
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
};

export const useDeleteVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: string) => videoApi.deleteVideo(videoId),
    onSuccess: () => {
      // Invalidate and refetch videos list
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
};

export const useRemixVideo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ videoId, prompt }: { videoId: string; prompt: string }) =>
      videoApi.remix(videoId, { prompt }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['videos'] });
    },
  });
};
