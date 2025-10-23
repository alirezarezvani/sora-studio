import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { VideoJob } from '@/types';

/**
 * Custom hook to auto-refresh video status when it's in progress
 */
export const useVideoPolling = (video: VideoJob | undefined, enabled: boolean = true) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !video) return;

    const isPending = video.status === 'queued' || video.status === 'in_progress';

    if (isPending) {
      // Poll every 10 seconds
      const interval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['video', video.id] });
      }, 10000);

      return () => clearInterval(interval);
    }
  }, [video?.id, video?.status, enabled, queryClient]);
};
