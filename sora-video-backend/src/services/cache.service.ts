import redis from '../config/redis.js';
import { VideoJob } from '../types/index.js';

class CacheService {
  private readonly keyPrefix = 'sora:video:';
  private readonly defaultTTL = 300; // 5 minutes in seconds

  /**
   * Check if Redis is available and connected
   */
  private isRedisAvailable(): boolean {
    return redis.isOpen;
  }

  /**
   * Generate cache key with prefix
   */
  private getKey(id: string): string {
    return `${this.keyPrefix}${id}`;
  }

  /**
   * Get cached value by key
   */
  async get(key: string): Promise<string | null> {
    try {
      if (!this.isRedisAvailable()) {
        console.log('[CacheService] Redis not available, skipping cache get');
        return null;
      }

      const value = await redis.get(key);

      if (value) {
        console.log(`[CacheService] Cache hit: ${key}`);
      } else {
        console.log(`[CacheService] Cache miss: ${key}`);
      }

      return value;
    } catch (error: any) {
      console.error(`[CacheService] Error getting cache (non-critical):`, error.message);
      return null; // Fail gracefully
    }
  }

  /**
   * Set cached value with optional TTL
   */
  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    try {
      if (!this.isRedisAvailable()) {
        console.log('[CacheService] Redis not available, skipping cache set');
        return false;
      }

      const ttlSeconds = ttl || this.defaultTTL;

      await redis.setEx(key, ttlSeconds, value);

      console.log(`[CacheService] Cache set: ${key}, TTL: ${ttlSeconds}s`);
      return true;
    } catch (error: any) {
      console.error(`[CacheService] Error setting cache (non-critical):`, error.message);
      return false; // Fail gracefully
    }
  }

  /**
   * Delete cached value by key
   */
  async del(key: string): Promise<boolean> {
    try {
      if (!this.isRedisAvailable()) {
        console.log('[CacheService] Redis not available, skipping cache delete');
        return false;
      }

      const result = await redis.del(key);

      console.log(`[CacheService] Cache deleted: ${key}`);
      return result > 0;
    } catch (error: any) {
      console.error(`[CacheService] Error deleting cache (non-critical):`, error.message);
      return false; // Fail gracefully
    }
  }

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      if (!this.isRedisAvailable()) {
        return false;
      }

      const result = await redis.exists(key);
      return result === 1;
    } catch (error: any) {
      console.error(`[CacheService] Error checking cache existence (non-critical):`, error.message);
      return false; // Fail gracefully
    }
  }

  /**
   * Cache video metadata with appropriate TTL based on status
   */
  async cacheVideo(video: VideoJob): Promise<boolean> {
    try {
      const key = this.getKey(video.id);
      const value = JSON.stringify(video);

      // Set TTL based on video status
      let ttl: number;
      if (video.status === 'completed') {
        ttl = 3600; // 1 hour for completed videos
      } else if (video.status === 'failed') {
        ttl = 300; // 5 minutes for failed videos
      } else {
        ttl = 300; // 5 minutes for in-progress/queued videos
      }

      console.log(`[CacheService] Caching video ${video.id}, status: ${video.status}, TTL: ${ttl}s`);
      return await this.set(key, value, ttl);
    } catch (error: any) {
      console.error(`[CacheService] Error caching video (non-critical):`, error.message);
      return false; // Fail gracefully
    }
  }

  /**
   * Get cached video metadata
   */
  async getCachedVideo(id: string): Promise<VideoJob | null> {
    try {
      const key = this.getKey(id);
      const cached = await this.get(key);

      if (!cached) {
        return null;
      }

      const video = JSON.parse(cached) as VideoJob;
      console.log(`[CacheService] Retrieved cached video: ${id}, status: ${video.status}`);
      return video;
    } catch (error: any) {
      console.error(`[CacheService] Error getting cached video (non-critical):`, error.message);
      return null; // Fail gracefully
    }
  }

  /**
   * Invalidate (remove) video from cache
   */
  async invalidateVideo(id: string): Promise<boolean> {
    try {
      const key = this.getKey(id);
      console.log(`[CacheService] Invalidating cache for video: ${id}`);
      return await this.del(key);
    } catch (error: any) {
      console.error(`[CacheService] Error invalidating video cache (non-critical):`, error.message);
      return false; // Fail gracefully
    }
  }

  /**
   * Invalidate multiple videos at once
   */
  async invalidateVideos(ids: string[]): Promise<void> {
    try {
      if (!this.isRedisAvailable()) {
        return;
      }

      const keys = ids.map((id) => this.getKey(id));

      if (keys.length > 0) {
        await redis.del(keys);
        console.log(`[CacheService] Invalidated ${keys.length} videos from cache`);
      }
    } catch (error: any) {
      console.error(`[CacheService] Error invalidating videos (non-critical):`, error.message);
      // Fail gracefully
    }
  }

  /**
   * Clear all video cache (use with caution)
   */
  async clearAllVideos(): Promise<void> {
    try {
      if (!this.isRedisAvailable()) {
        return;
      }

      const pattern = `${this.keyPrefix}*`;
      const keys = await redis.keys(pattern);

      if (keys.length > 0) {
        await redis.del(keys);
        console.log(`[CacheService] Cleared ${keys.length} videos from cache`);
      } else {
        console.log('[CacheService] No videos in cache to clear');
      }
    } catch (error: any) {
      console.error(`[CacheService] Error clearing cache (non-critical):`, error.message);
      // Fail gracefully
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ total_keys: number; video_keys: number }> {
    try {
      if (!this.isRedisAvailable()) {
        return { total_keys: 0, video_keys: 0 };
      }

      const pattern = `${this.keyPrefix}*`;
      const videoKeys = await redis.keys(pattern);
      const allKeys = await redis.dbSize();

      return {
        total_keys: allKeys,
        video_keys: videoKeys.length,
      };
    } catch (error: any) {
      console.error(`[CacheService] Error getting cache stats (non-critical):`, error.message);
      return { total_keys: 0, video_keys: 0 };
    }
  }
}

export default new CacheService();
