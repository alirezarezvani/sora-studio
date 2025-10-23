import videoService from '../services/video.service.js';
import soraService from '../services/sora.service.js';
import cacheService from '../services/cache.service.js';
import eventService from '../services/event.service.js';

class StatusUpdater {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private updateInterval: number = 30000; // 30 seconds

  /**
   * Start the status updater worker
   */
  start(): void {
    if (this.isRunning) {
      console.log('[StatusUpdater] Already running');
      return;
    }

    console.log('[StatusUpdater] Starting background worker...');
    this.isRunning = true;

    // Run immediately
    this.updatePendingVideos();

    // Then run on interval
    this.intervalId = setInterval(() => {
      this.updatePendingVideos();
    }, this.updateInterval);

    console.log(`[StatusUpdater] Worker started (polling every ${this.updateInterval / 1000}s)`);
  }

  /**
   * Stop the status updater worker
   */
  stop(): void {
    if (!this.isRunning) {
      console.log('[StatusUpdater] Not running');
      return;
    }

    console.log('[StatusUpdater] Stopping background worker...');

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('[StatusUpdater] Worker stopped');
  }

  /**
   * Update all pending videos (queued or in_progress)
   */
  private async updatePendingVideos(): Promise<void> {
    try {
      // Get all videos with pending status
      const pendingVideos = await videoService.getPendingVideos();

      if (pendingVideos.length === 0) {
        console.log('[StatusUpdater] No pending videos to update');
        return;
      }

      console.log(`[StatusUpdater] Updating ${pendingVideos.length} pending videos...`);

      // Update each video
      const updatePromises = pendingVideos.map((video) => this.updateVideoStatus(video.id));

      // Wait for all updates (but don't fail if one fails)
      const results = await Promise.allSettled(updatePromises);

      // Count successes and failures
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      console.log(
        `[StatusUpdater] Update complete: ${successful} successful, ${failed} failed`
      );
    } catch (error: any) {
      console.error('[StatusUpdater] Error updating pending videos:', error.message);
      // Don't throw - just log and continue
    }
  }

  /**
   * Update a single video's status from OpenAI
   */
  private async updateVideoStatus(videoId: string): Promise<void> {
    try {
      console.log(`[StatusUpdater] Checking status for video: ${videoId}`);

      // Get current status from database
      const dbVideo = await videoService.getVideoById(videoId);

      if (!dbVideo) {
        console.log(`[StatusUpdater] Video not found in database: ${videoId}`);
        return;
      }

      // Skip if already completed or failed
      if (dbVideo.status === 'completed' || dbVideo.status === 'failed') {
        console.log(`[StatusUpdater] Video ${videoId} already in final state: ${dbVideo.status}`);
        return;
      }

      // Get live status from OpenAI
      const liveVideo = await soraService.getVideoStatus(videoId);

      // Check if status changed
      if (liveVideo.status === dbVideo.status && liveVideo.progress === dbVideo.progress) {
        console.log(
          `[StatusUpdater] No change for video ${videoId}: ${liveVideo.status} (${liveVideo.progress}%)`
        );
        return;
      }

      console.log(
        `[StatusUpdater] Status changed for video ${videoId}: ${dbVideo.status} → ${liveVideo.status}`
      );

      // Update database
      await videoService.updateVideoStatus(videoId, liveVideo.status, {
        progress: liveVideo.progress,
        file_url: liveVideo.file_url,
        thumbnail_url: liveVideo.thumbnail_url,
        completed_at: liveVideo.completed_at ? new Date(liveVideo.completed_at * 1000) : undefined,
        expires_at: liveVideo.expires_at ? new Date(liveVideo.expires_at * 1000) : undefined,
        error_message: liveVideo.error?.message,
      });

      // Update cache
      await cacheService.cacheVideo(liveVideo);

      // Log status change
      await eventService.logStatusChanged(videoId, dbVideo.status, liveVideo.status);

      // Log failure if video failed
      if (liveVideo.status === 'failed' && liveVideo.error) {
        await eventService.logVideoFailed(videoId, liveVideo.error.message);
      }

      console.log(`[StatusUpdater] Updated video ${videoId} to status: ${liveVideo.status}`);
    } catch (error: any) {
      console.error(`[StatusUpdater] Error updating video ${videoId}:`, error.message);
      // Don't throw - just log and continue to next video
    }
  }

  /**
   * Get worker status
   */
  getStatus(): { running: boolean; interval: number } {
    return {
      running: this.isRunning,
      interval: this.updateInterval,
    };
  }

  /**
   * Set update interval (in milliseconds)
   */
  setInterval(intervalMs: number): void {
    if (intervalMs < 10000) {
      throw new Error('Interval must be at least 10 seconds');
    }

    this.updateInterval = intervalMs;

    if (this.isRunning) {
      console.log('[StatusUpdater] Restarting with new interval...');
      this.stop();
      this.start();
    }
  }
}

// Export singleton instance
export default new StatusUpdater();
