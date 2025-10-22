-- Sora Studio Database Schema
-- PostgreSQL 14+

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    model VARCHAR(50) NOT NULL DEFAULT 'sora-2',
    status VARCHAR(50) NOT NULL DEFAULT 'queued',
    progress INTEGER DEFAULT 0,
    prompt TEXT NOT NULL,
    size VARCHAR(50),
    seconds VARCHAR(10),
    quality VARCHAR(50),
    remixed_from_video_id VARCHAR(255),
    file_url TEXT,
    thumbnail_url TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    expires_at TIMESTAMP,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_videos_user_id ON videos(user_id);
CREATE INDEX IF NOT EXISTS idx_videos_status ON videos(status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_user_status ON videos(user_id, status);

-- Video events table (for audit trail)
CREATE TABLE IF NOT EXISTS video_events (
    id SERIAL PRIMARY KEY,
    video_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    event_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add foreign key constraint for video_events
ALTER TABLE video_events
    ADD CONSTRAINT fk_video_events_video_id
    FOREIGN KEY (video_id)
    REFERENCES videos(id)
    ON DELETE CASCADE;

-- Indexes for video_events
CREATE INDEX IF NOT EXISTS idx_video_events_video_id ON video_events(video_id);
CREATE INDEX IF NOT EXISTS idx_video_events_event_type ON video_events(event_type);
CREATE INDEX IF NOT EXISTS idx_video_events_created_at ON video_events(created_at DESC);

-- User quotas table
CREATE TABLE IF NOT EXISTS user_quotas (
    user_id VARCHAR(255) PRIMARY KEY,
    videos_created INTEGER DEFAULT 0,
    videos_limit INTEGER DEFAULT 100,
    reset_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_videos_updated_at BEFORE UPDATE ON videos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_quotas_updated_at BEFORE UPDATE ON user_quotas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user quota (example)
INSERT INTO user_quotas (user_id, videos_created, videos_limit)
VALUES ('admin', 0, 1000)
ON CONFLICT (user_id) DO NOTHING;

-- Create view for active videos
CREATE OR REPLACE VIEW active_videos AS
SELECT * FROM videos
WHERE status IN ('queued', 'in_progress')
ORDER BY created_at ASC;

-- Create view for completed videos
CREATE OR REPLACE VIEW completed_videos AS
SELECT * FROM videos
WHERE status = 'completed'
ORDER BY completed_at DESC;
