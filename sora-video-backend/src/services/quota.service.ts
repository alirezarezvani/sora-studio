import pool from '../config/database.js';

interface UserQuota {
  user_id: string;
  videos_created: number;
  videos_limit: number;
  reset_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

interface QuotaCheckResult {
  allowed: boolean;
  current_usage: number;
  limit: number;
  remaining: number;
  message?: string;
}

class QuotaService {
  /**
   * Get user's current quota information
   */
  async getUserQuota(userId: string): Promise<UserQuota> {
    try {
      console.log(`[QuotaService] Fetching quota for user: ${userId}`);

      const query = 'SELECT * FROM user_quotas WHERE user_id = $1';
      const result = await pool.query(query, [userId]);

      if (result.rows.length === 0) {
        // Create default quota for new user
        console.log(`[QuotaService] Creating default quota for new user: ${userId}`);
        return this.createDefaultQuota(userId);
      }

      const quota = result.rows[0];
      console.log(`[QuotaService] User ${userId} quota: ${quota.videos_created}/${quota.videos_limit}`);

      return {
        user_id: quota.user_id,
        videos_created: quota.videos_created,
        videos_limit: quota.videos_limit,
        reset_at: quota.reset_at,
        created_at: quota.created_at,
        updated_at: quota.updated_at,
      };
    } catch (error: any) {
      console.error(`[QuotaService] Error fetching quota:`, error.message);
      throw new Error(`Failed to fetch user quota: ${error.message}`);
    }
  }

  /**
   * Check if user can create a video based on their quota
   */
  async checkQuota(userId: string, cost?: number): Promise<QuotaCheckResult> {
    try {
      console.log(`[QuotaService] Checking quota for user: ${userId}`);

      const quota = await this.getUserQuota(userId);

      // Check if quota needs to be reset (monthly)
      if (quota.reset_at && new Date() > quota.reset_at) {
        console.log(`[QuotaService] Resetting monthly quota for user: ${userId}`);
        await this.resetMonthlyQuota(userId);
        // Refetch after reset
        return this.checkQuota(userId, cost);
      }

      const remaining = quota.videos_limit - quota.videos_created;
      const allowed = remaining > 0;

      const result: QuotaCheckResult = {
        allowed,
        current_usage: quota.videos_created,
        limit: quota.videos_limit,
        remaining,
      };

      if (!allowed) {
        result.message = `Quota exceeded. You have used ${quota.videos_created} of ${quota.videos_limit} videos.`;
        console.log(`[QuotaService] Quota exceeded for user ${userId}`);
      } else {
        console.log(`[QuotaService] Quota check passed for user ${userId}: ${remaining} videos remaining`);
      }

      return result;
    } catch (error: any) {
      console.error(`[QuotaService] Error checking quota:`, error.message);
      throw new Error(`Failed to check quota: ${error.message}`);
    }
  }

  /**
   * Track video generation usage
   */
  async trackUsage(
    userId: string,
    videoId: string,
    cost: number
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      console.log(`[QuotaService] Tracking usage for user ${userId}, video ${videoId}, cost: $${cost}`);

      // Increment videos_created count
      const query = `
        UPDATE user_quotas
        SET videos_created = videos_created + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
        RETURNING *
      `;

      const result = await client.query(query, [userId]);

      if (result.rows.length === 0) {
        throw new Error(`User quota not found for user: ${userId}`);
      }

      await client.query('COMMIT');

      const updatedQuota = result.rows[0];
      console.log(
        `[QuotaService] Usage tracked: user ${userId} has created ${updatedQuota.videos_created}/${updatedQuota.videos_limit} videos`
      );
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error(`[QuotaService] Error tracking usage:`, error.message);
      throw new Error(`Failed to track usage: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Reset monthly quota for a user
   */
  async resetMonthlyQuota(userId: string): Promise<UserQuota> {
    try {
      console.log(`[QuotaService] Resetting monthly quota for user: ${userId}`);

      // Calculate next reset date (first day of next month)
      const nextReset = new Date();
      nextReset.setMonth(nextReset.getMonth() + 1);
      nextReset.setDate(1);
      nextReset.setHours(0, 0, 0, 0);

      const query = `
        UPDATE user_quotas
        SET videos_created = 0,
            reset_at = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
        RETURNING *
      `;

      const result = await pool.query(query, [userId, nextReset]);

      if (result.rows.length === 0) {
        throw new Error(`User quota not found for user: ${userId}`);
      }

      const quota = result.rows[0];
      console.log(`[QuotaService] Monthly quota reset for user ${userId}. Next reset: ${nextReset}`);

      return {
        user_id: quota.user_id,
        videos_created: quota.videos_created,
        videos_limit: quota.videos_limit,
        reset_at: quota.reset_at,
        created_at: quota.created_at,
        updated_at: quota.updated_at,
      };
    } catch (error: any) {
      console.error(`[QuotaService] Error resetting quota:`, error.message);
      throw new Error(`Failed to reset quota: ${error.message}`);
    }
  }

  /**
   * Update quota limit for a user (admin function)
   */
  async updateQuotaLimit(userId: string, newLimit: number): Promise<UserQuota> {
    try {
      console.log(`[QuotaService] Updating quota limit for user ${userId} to ${newLimit}`);

      if (newLimit < 0) {
        throw new Error('Quota limit must be non-negative');
      }

      const query = `
        UPDATE user_quotas
        SET videos_limit = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
        RETURNING *
      `;

      const result = await pool.query(query, [userId, newLimit]);

      if (result.rows.length === 0) {
        // Create quota if it doesn't exist
        return this.createDefaultQuota(userId, newLimit);
      }

      const quota = result.rows[0];
      console.log(`[QuotaService] Quota limit updated for user ${userId}: ${newLimit}`);

      return {
        user_id: quota.user_id,
        videos_created: quota.videos_created,
        videos_limit: quota.videos_limit,
        reset_at: quota.reset_at,
        created_at: quota.created_at,
        updated_at: quota.updated_at,
      };
    } catch (error: any) {
      console.error(`[QuotaService] Error updating quota limit:`, error.message);
      throw new Error(`Failed to update quota limit: ${error.message}`);
    }
  }

  /**
   * Create default quota for a new user
   */
  private async createDefaultQuota(userId: string, limit: number = 100): Promise<UserQuota> {
    try {
      console.log(`[QuotaService] Creating default quota for user: ${userId}`);

      // Calculate first reset date (first day of next month)
      const nextReset = new Date();
      nextReset.setMonth(nextReset.getMonth() + 1);
      nextReset.setDate(1);
      nextReset.setHours(0, 0, 0, 0);

      const query = `
        INSERT INTO user_quotas (user_id, videos_created, videos_limit, reset_at)
        VALUES ($1, 0, $2, $3)
        RETURNING *
      `;

      const result = await pool.query(query, [userId, limit, nextReset]);
      const quota = result.rows[0];

      console.log(`[QuotaService] Default quota created for user ${userId}: 0/${limit}`);

      return {
        user_id: quota.user_id,
        videos_created: quota.videos_created,
        videos_limit: quota.videos_limit,
        reset_at: quota.reset_at,
        created_at: quota.created_at,
        updated_at: quota.updated_at,
      };
    } catch (error: any) {
      console.error(`[QuotaService] Error creating default quota:`, error.message);
      throw new Error(`Failed to create default quota: ${error.message}`);
    }
  }

  /**
   * Calculate cost based on model and duration
   */
  calculateCost(model: string, seconds: string | undefined): number {
    const duration = parseInt(seconds || '5');

    // Pricing per second
    const costPerSecond = {
      'sora-2': 0.10,
      'sora-2-pro': 0.20,
    };

    const rate = costPerSecond[model as keyof typeof costPerSecond] || costPerSecond['sora-2'];
    const cost = rate * duration;

    console.log(`[QuotaService] Cost calculation: ${model}, ${duration}s = $${cost.toFixed(2)}`);
    return cost;
  }
}

export default new QuotaService();
