import { useQuery } from '@tanstack/react-query';
import { quotaApi, QuotaData } from '@/lib/api/quota';

/**
 * Hook to fetch and manage user quota data
 * Automatically refetches every 30 seconds to keep data fresh
 */
export const useQuota = () => {
  return useQuery<QuotaData>({
    queryKey: ['quota'],
    queryFn: () => quotaApi.getQuota(),
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
    retry: 2, // Retry failed requests twice
  });
};

/**
 * Hook to check if user can create a video
 * Useful for showing warnings before attempting creation
 */
export const useQuotaCheck = () => {
  return useQuery({
    queryKey: ['quota', 'check'],
    queryFn: () => quotaApi.checkQuota(),
    staleTime: 10 * 1000, // Consider data stale after 10 seconds
  });
};
