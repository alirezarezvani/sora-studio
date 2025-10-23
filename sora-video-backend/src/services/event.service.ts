import pool from '../config/database.js';

type EventType = 'created' | 'status_changed' | 'downloaded' | 'deleted' | 'failed' | 'remixed';

interface EventData {
  video_id: string;
  event_type: EventType;
  event_data?: {
    old_status?: string;
    new_status?: string;
    error_message?: string;
    cost?: number;
    ip_address?: string;
    user_agent?: string;
    [key: string]: any;
  };
}

interface VideoEvent {
  id: number;
  video_id: string;
  event_type: string;
  event_data: any;
  created_at: Date;
}

class EventService {
  /**
   * Log a video event to the database
   * Non-blocking - failures won't affect main operations
   */
  async logEvent(event: EventData): Promise<void> {
    try {
      console.log(`[EventService] Logging event: ${event.event_type} for video ${event.video_id}`);

      const query = `
        INSERT INTO video_events (video_id, event_type, event_data)
        VALUES ($1, $2, $3)
        RETURNING id
      `;

      const values = [
        event.video_id,
        event.event_type,
        event.event_data ? JSON.stringify(event.event_data) : '{}',
      ];

      await pool.query(query, values);

      console.log(`[EventService] Event logged successfully: ${event.event_type}`);
    } catch (error: any) {
      // Don't throw errors - logging should be non-blocking
      console.error(`[EventService] Failed to log event (non-critical):`, error.message);
    }
  }

  /**
   * Get all events for a specific video
   */
  async getVideoEvents(videoId: string): Promise<VideoEvent[]> {
    try {
      console.log(`[EventService] Fetching events for video: ${videoId}`);

      const query = `
        SELECT * FROM video_events
        WHERE video_id = $1
        ORDER BY created_at DESC
      `;

      const result = await pool.query(query, [videoId]);

      console.log(`[EventService] Found ${result.rows.length} events for video ${videoId}`);
      return result.rows.map((row) => ({
        id: row.id,
        video_id: row.video_id,
        event_type: row.event_type,
        event_data: row.event_data,
        created_at: row.created_at,
      }));
    } catch (error: any) {
      console.error(`[EventService] Error fetching video events:`, error.message);
      throw new Error(`Failed to fetch video events: ${error.message}`);
    }
  }

  /**
   * Get recent events for a user (across all their videos)
   */
  async getUserEvents(userId: string, limit: number = 50): Promise<VideoEvent[]> {
    try {
      console.log(`[EventService] Fetching events for user: ${userId}, limit: ${limit}`);

      const query = `
        SELECT ve.*
        FROM video_events ve
        JOIN videos v ON ve.video_id = v.id
        WHERE v.user_id = $1
        ORDER BY ve.created_at DESC
        LIMIT $2
      `;

      const result = await pool.query(query, [userId, limit]);

      console.log(`[EventService] Found ${result.rows.length} events for user ${userId}`);
      return result.rows.map((row) => ({
        id: row.id,
        video_id: row.video_id,
        event_type: row.event_type,
        event_data: row.event_data,
        created_at: row.created_at,
      }));
    } catch (error: any) {
      console.error(`[EventService] Error fetching user events:`, error.message);
      throw new Error(`Failed to fetch user events: ${error.message}`);
    }
  }

  /**
   * Helper methods for specific event types
   */

  async logVideoCreated(videoId: string, userId: string, model: string, prompt: string): Promise<void> {
    return this.logEvent({
      video_id: videoId,
      event_type: 'created',
      event_data: {
        user_id: userId,
        model,
        prompt_length: prompt.length,
      },
    });
  }

  async logStatusChanged(videoId: string, oldStatus: string, newStatus: string): Promise<void> {
    return this.logEvent({
      video_id: videoId,
      event_type: 'status_changed',
      event_data: {
        old_status: oldStatus,
        new_status: newStatus,
      },
    });
  }

  async logVideoDownloaded(videoId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    return this.logEvent({
      video_id: videoId,
      event_type: 'downloaded',
      event_data: {
        ip_address: ipAddress,
        user_agent: userAgent,
      },
    });
  }

  async logVideoDeleted(videoId: string, userId: string): Promise<void> {
    return this.logEvent({
      video_id: videoId,
      event_type: 'deleted',
      event_data: {
        user_id: userId,
      },
    });
  }

  async logVideoFailed(videoId: string, errorMessage: string): Promise<void> {
    return this.logEvent({
      video_id: videoId,
      event_type: 'failed',
      event_data: {
        error_message: errorMessage,
      },
    });
  }

  async logVideoRemixed(videoId: string, sourceVideoId: string, newPrompt: string): Promise<void> {
    return this.logEvent({
      video_id: videoId,
      event_type: 'remixed',
      event_data: {
        source_video_id: sourceVideoId,
        prompt_length: newPrompt.length,
      },
    });
  }
}

export default new EventService();
