import pool from '../config/database.js';
import { VideoJob } from '../types/index.js';

interface VideoCreateData {
  id: string;
  user_id: string;
  model: string;
  status: string;
  progress: number;
  prompt: string;
  size?: string;
  seconds?: string;
  quality?: string;
  remixed_from_video_id?: string;
  metadata?: any;
}

interface VideoFilters {
  status?: string;
  from_date?: Date;
  to_date?: Date;
  limit?: number;
  offset?: number;
}

interface VideoStats {
  total_videos: number;
  completed_videos: number;
  failed_videos: number;
  in_progress_videos: number;
  queued_videos: number;
}

class VideoService {
  /**
   * Create a new video record in the database
   */
  async createVideo(videoData: VideoCreateData): Promise<VideoJob> {
    try {
      console.log(`[VideoService] Creating video record: ${videoData.id}`);

      const query = `
        INSERT INTO videos (
          id, user_id, model, status, progress, prompt,
          size, seconds, quality, remixed_from_video_id, metadata
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;

      const values = [
        videoData.id,
        videoData.user_id,
        videoData.model,
        videoData.status,
        videoData.progress,
        videoData.prompt,
        videoData.size || null,
        videoData.seconds || null,
        videoData.quality || null,
        videoData.remixed_from_video_id || null,
        videoData.metadata ? JSON.stringify(videoData.metadata) : '{}',
      ];

      const result = await pool.query(query, values);
      const video = result.rows[0];

      console.log(`[VideoService] Video record created: ${video.id}`);
      return this.mapToVideoJob(video);
    } catch (error: any) {
      console.error(`[VideoService] Error creating video:`, error.message);
      throw new Error(`Failed to create video record: ${error.message}`);
    }
  }

  /**
   * Get video by ID from database
   */
  async getVideoById(id: string): Promise<VideoJob | null> {
    try {
      console.log(`[VideoService] Fetching video: ${id}`);

      const query = 'SELECT * FROM videos WHERE id = $1';
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        console.log(`[VideoService] Video not found: ${id}`);
        return null;
      }

      const video = result.rows[0];
      console.log(`[VideoService] Video found: ${id}, status: ${video.status}`);
      return this.mapToVideoJob(video);
    } catch (error: any) {
      console.error(`[VideoService] Error fetching video ${id}:`, error.message);
      throw new Error(`Failed to fetch video: ${error.message}`);
    }
  }

  /**
   * Get videos by user with optional filtering
   */
  async getVideosByUser(userId: string, filters?: VideoFilters): Promise<VideoJob[]> {
    try {
      console.log(`[VideoService] Fetching videos for user: ${userId}`, filters);

      let query = 'SELECT * FROM videos WHERE user_id = $1';
      const values: any[] = [userId];
      let paramCount = 1;

      // Apply filters
      if (filters?.status) {
        paramCount++;
        query += ` AND status = $${paramCount}`;
        values.push(filters.status);
      }

      if (filters?.from_date) {
        paramCount++;
        query += ` AND created_at >= $${paramCount}`;
        values.push(filters.from_date);
      }

      if (filters?.to_date) {
        paramCount++;
        query += ` AND created_at <= $${paramCount}`;
        values.push(filters.to_date);
      }

      // Order by creation date (newest first)
      query += ' ORDER BY created_at DESC';

      // Apply pagination
      if (filters?.limit) {
        paramCount++;
        query += ` LIMIT $${paramCount}`;
        values.push(filters.limit);
      }

      if (filters?.offset) {
        paramCount++;
        query += ` OFFSET $${paramCount}`;
        values.push(filters.offset);
      }

      const result = await pool.query(query, values);

      console.log(`[VideoService] Found ${result.rows.length} videos for user ${userId}`);
      return result.rows.map((row) => this.mapToVideoJob(row));
    } catch (error: any) {
      console.error(`[VideoService] Error fetching videos for user ${userId}:`, error.message);
      throw new Error(`Failed to fetch videos: ${error.message}`);
    }
  }

  /**
   * Update video status and metadata
   */
  async updateVideoStatus(
    id: string,
    status: string,
    metadata?: {
      progress?: number;
      file_url?: string;
      thumbnail_url?: string;
      error_message?: string;
      completed_at?: Date;
      expires_at?: Date;
    }
  ): Promise<VideoJob> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      console.log(`[VideoService] Updating video ${id} status to: ${status}`);

      // Build dynamic update query
      const updates: string[] = ['status = $2', 'updated_at = CURRENT_TIMESTAMP'];
      const values: any[] = [id, status];
      let paramCount = 2;

      if (metadata?.progress !== undefined) {
        paramCount++;
        updates.push(`progress = $${paramCount}`);
        values.push(metadata.progress);
      }

      if (metadata?.file_url) {
        paramCount++;
        updates.push(`file_url = $${paramCount}`);
        values.push(metadata.file_url);
      }

      if (metadata?.thumbnail_url) {
        paramCount++;
        updates.push(`thumbnail_url = $${paramCount}`);
        values.push(metadata.thumbnail_url);
      }

      if (metadata?.error_message) {
        paramCount++;
        updates.push(`error_message = $${paramCount}`);
        values.push(metadata.error_message);
      }

      if (metadata?.completed_at) {
        paramCount++;
        updates.push(`completed_at = $${paramCount}`);
        values.push(metadata.completed_at);
      }

      if (metadata?.expires_at) {
        paramCount++;
        updates.push(`expires_at = $${paramCount}`);
        values.push(metadata.expires_at);
      }

      const query = `
        UPDATE videos
        SET ${updates.join(', ')}
        WHERE id = $1
        RETURNING *
      `;

      const result = await client.query(query, values);

      if (result.rows.length === 0) {
        throw new Error(`Video not found: ${id}`);
      }

      await client.query('COMMIT');

      const video = result.rows[0];
      console.log(`[VideoService] Video ${id} updated successfully`);
      return this.mapToVideoJob(video);
    } catch (error: any) {
      await client.query('ROLLBACK');
      console.error(`[VideoService] Error updating video ${id}:`, error.message);
      throw new Error(`Failed to update video: ${error.message}`);
    } finally {
      client.release();
    }
  }

  /**
   * Soft delete a video (mark as deleted without removing from database)
   */
  async deleteVideo(id: string): Promise<boolean> {
    try {
      console.log(`[VideoService] Soft deleting video: ${id}`);

      // For now, we'll just update status to 'deleted'
      // Later we can add a deleted_at column if needed
      const query = `
        UPDATE videos
        SET status = 'deleted', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        console.log(`[VideoService] Video not found for deletion: ${id}`);
        return false;
      }

      console.log(`[VideoService] Video ${id} soft deleted successfully`);
      return true;
    } catch (error: any) {
      console.error(`[VideoService] Error deleting video ${id}:`, error.message);
      throw new Error(`Failed to delete video: ${error.message}`);
    }
  }

  /**
   * Archive old video (for cleanup purposes)
   */
  async archiveVideo(id: string): Promise<boolean> {
    try {
      console.log(`[VideoService] Archiving video: ${id}`);

      const query = `
        UPDATE videos
        SET status = 'archived', updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING id
      `;

      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        console.log(`[VideoService] Video not found for archiving: ${id}`);
        return false;
      }

      console.log(`[VideoService] Video ${id} archived successfully`);
      return true;
    } catch (error: any) {
      console.error(`[VideoService] Error archiving video ${id}:`, error.message);
      throw new Error(`Failed to archive video: ${error.message}`);
    }
  }

  /**
   * Get statistics for videos (optionally filtered by user)
   */
  async getVideoStats(userId?: string): Promise<VideoStats> {
    try {
      console.log(`[VideoService] Fetching video stats${userId ? ` for user ${userId}` : ''}`);

      let query = `
        SELECT
          COUNT(*) as total_videos,
          COUNT(*) FILTER (WHERE status = 'completed') as completed_videos,
          COUNT(*) FILTER (WHERE status = 'failed') as failed_videos,
          COUNT(*) FILTER (WHERE status = 'in_progress') as in_progress_videos,
          COUNT(*) FILTER (WHERE status = 'queued') as queued_videos
        FROM videos
      `;

      const values: any[] = [];

      if (userId) {
        query += ' WHERE user_id = $1';
        values.push(userId);
      }

      const result = await pool.query(query, values);
      const stats = result.rows[0];

      console.log(`[VideoService] Stats retrieved:`, stats);

      return {
        total_videos: parseInt(stats.total_videos),
        completed_videos: parseInt(stats.completed_videos),
        failed_videos: parseInt(stats.failed_videos),
        in_progress_videos: parseInt(stats.in_progress_videos),
        queued_videos: parseInt(stats.queued_videos),
      };
    } catch (error: any) {
      console.error(`[VideoService] Error fetching stats:`, error.message);
      throw new Error(`Failed to fetch video stats: ${error.message}`);
    }
  }

  /**
   * Get videos that need status updates (queued or in_progress)
   */
  async getPendingVideos(): Promise<VideoJob[]> {
    try {
      console.log(`[VideoService] Fetching pending videos`);

      const query = `
        SELECT * FROM videos
        WHERE status IN ('queued', 'in_progress')
        ORDER BY created_at ASC
      `;

      const result = await pool.query(query);

      console.log(`[VideoService] Found ${result.rows.length} pending videos`);
      return result.rows.map((row) => this.mapToVideoJob(row));
    } catch (error: any) {
      console.error(`[VideoService] Error fetching pending videos:`, error.message);
      throw new Error(`Failed to fetch pending videos: ${error.message}`);
    }
  }

  /**
   * Map database row to VideoJob type
   */
  private mapToVideoJob(row: any): VideoJob {
    return {
      id: row.id,
      object: 'video',
      model: row.model,
      status: row.status,
      progress: row.progress,
      prompt: row.prompt,
      size: row.size,
      seconds: row.seconds,
      quality: row.quality,
      remixed_from_video_id: row.remixed_from_video_id,
      file_url: row.file_url,
      thumbnail_url: row.thumbnail_url,
      created_at: Math.floor(new Date(row.created_at).getTime() / 1000),
      completed_at: row.completed_at ? Math.floor(new Date(row.completed_at).getTime() / 1000) : undefined,
      expires_at: row.expires_at ? Math.floor(new Date(row.expires_at).getTime() / 1000) : undefined,
      error: row.error_message
        ? {
            code: 'generation_failed',
            message: row.error_message,
          }
        : undefined,
    };
  }
}

export default new VideoService();
