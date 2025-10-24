import { Request, Response, NextFunction } from 'express';
import quotaService from '../services/quota.service.js';

/**
 * Get current user's quota information
 * GET /api/quota
 */
export async function getUserQuota(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const userId = req.user?.id || 'anonymous';

    console.log(`[QuotaController] Fetching quota for user: ${userId}`);

    const quota = await quotaService.getUserQuota(userId);
    const cost = calculateMonthlyCost(quota.videos_created);

    res.status(200).json({
      success: true,
      data: {
        user_id: quota.user_id,
        videos_created: quota.videos_created,
        videos_limit: quota.videos_limit,
        remaining: quota.videos_limit - quota.videos_created,
        reset_at: quota.reset_at,
        estimated_cost: cost,
      },
    });
  } catch (error: any) {
    console.error('[QuotaController] Error fetching quota:', error.message);
    next(error);
  }
}

/**
 * Check if user can create a video (without actually creating it)
 * GET /api/quota/check
 */
export async function checkQuota(req: Request, res: Response, next: NextFunction): Promise<any> {
  try {
    const userId = req.user?.id || 'anonymous';

    console.log(`[QuotaController] Checking quota for user: ${userId}`);

    const quotaCheck = await quotaService.checkQuota(userId);

    res.status(200).json({
      success: true,
      data: quotaCheck,
    });
  } catch (error: any) {
    console.error('[QuotaController] Error checking quota:', error.message);
    next(error);
  }
}

/**
 * Calculate estimated monthly cost based on video count
 * Average cost per video: $0.40 (assuming mix of sora-2 and sora-2-pro, 5-10 seconds)
 */
function calculateMonthlyCost(videoCount: number): number {
  const avgCostPerVideo = 0.40;
  return parseFloat((videoCount * avgCostPerVideo).toFixed(2));
}
