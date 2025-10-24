import apiClient from './client';

export interface QuotaData {
  user_id: string;
  videos_created: number;
  videos_limit: number;
  remaining: number;
  reset_at: string | null;
  estimated_cost: number;
}

export interface QuotaCheckResult {
  allowed: boolean;
  current_usage: number;
  limit: number;
  remaining: number;
  message?: string;
}

export const quotaApi = {
  /**
   * Get current user's quota information
   */
  getQuota: async (): Promise<QuotaData> => {
    const response = await apiClient.get('/quota');
    return response.data.data;
  },

  /**
   * Check if user can create a video without actually creating it
   */
  checkQuota: async (): Promise<QuotaCheckResult> => {
    const response = await apiClient.get('/quota/check');
    return response.data.data;
  },
};
