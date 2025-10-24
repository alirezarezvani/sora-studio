import { QuotaData, QuotaCheckResult } from '../api/quota';

/**
 * Simulate network delay for mock API calls
 */
export const simulateNetworkDelay = (min: number = 100, max: number = 300): Promise<void> => {
  const delay = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * Mock quota data - simulates a user with reasonable usage
 */
class MockQuotaStore {
  private quota: QuotaData = {
    user_id: 'demo-user-12345',
    videos_created: 8,
    videos_limit: 100,
    remaining: 92,
    reset_at: this.getNextMonthReset(),
    estimated_cost: 3.20, // 8 videos * $0.40 average
  };

  /**
   * Calculate next reset date (1st of next month)
   */
  private getNextMonthReset(): string {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toISOString();
  }

  /**
   * Get current quota information
   */
  async getQuota(): Promise<QuotaData> {
    await simulateNetworkDelay(150, 400);
    return { ...this.quota };
  }

  /**
   * Check if user can create a video
   */
  async checkQuota(): Promise<QuotaCheckResult> {
    await simulateNetworkDelay(100, 250);

    const remaining = this.quota.videos_limit - this.quota.videos_created;
    const allowed = remaining > 0;

    return {
      allowed,
      current_usage: this.quota.videos_created,
      limit: this.quota.videos_limit,
      remaining,
      message: allowed
        ? `You have ${remaining} videos remaining this month`
        : 'Monthly quota limit reached. Resets on the 1st of next month.',
    };
  }

  /**
   * Increment video count (called when creating a video)
   */
  incrementUsage(): void {
    if (this.quota.videos_created < this.quota.videos_limit) {
      this.quota.videos_created++;
      this.quota.remaining = this.quota.videos_limit - this.quota.videos_created;
      this.quota.estimated_cost = parseFloat(
        (this.quota.videos_created * 0.4).toFixed(2)
      );
    }
  }

  /**
   * Reset quota (for testing)
   */
  reset(): void {
    this.quota.videos_created = 8;
    this.quota.remaining = 92;
    this.quota.estimated_cost = 3.20;
    this.quota.reset_at = this.getNextMonthReset();
  }
}

// Export singleton instance
export const mockQuotaStore = new MockQuotaStore();

// Export convenience functions
export const mockQuotaApi = {
  getQuota: () => mockQuotaStore.getQuota(),
  checkQuota: () => mockQuotaStore.checkQuota(),
  incrementUsage: () => mockQuotaStore.incrementUsage(),
  reset: () => mockQuotaStore.reset(),
};
