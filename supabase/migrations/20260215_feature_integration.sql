-- PureShare Feature Integration Migrations
-- Date: February 15, 2026
-- Features: Download Counter, Notifications, Analytics, File Requests

-- ============================================
-- 1. DOWNLOAD COUNTER - Add to existing files table
-- ============================================

ALTER TABLE files ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0;

-- ============================================
-- 2. SHARE NOTIFICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS share_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id UUID REFERENCES shares(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    notify_on_download BOOLEAN DEFAULT true,
    notify_on_view BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick lookups by share
CREATE INDEX IF NOT EXISTS idx_share_notifications_share_id 
ON share_notifications(share_id);

-- ============================================
-- 3. SHARE ANALYTICS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS share_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_id UUID REFERENCES shares(id) ON DELETE CASCADE,
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('view', 'download', 'download_file')),
    file_id UUID REFERENCES files(id) ON DELETE SET NULL,
    ip_hash VARCHAR(64),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_share_analytics_share_id 
ON share_analytics(share_id);

CREATE INDEX IF NOT EXISTS idx_share_analytics_created_at 
ON share_analytics(created_at);

CREATE INDEX IF NOT EXISTS idx_share_analytics_event_type 
ON share_analytics(event_type);

-- ============================================
-- 4. FILE REQUESTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS file_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    share_link VARCHAR(12) UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    description TEXT,
    expires_at TIMESTAMPTZ NOT NULL,
    max_file_size BIGINT DEFAULT 104857600, -- 100MB default
    max_files INTEGER DEFAULT 10,
    require_email BOOLEAN DEFAULT false,
    allow_multiple_uploaders BOOLEAN DEFAULT true,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for file request lookup by share_link
CREATE INDEX IF NOT EXISTS idx_file_requests_share_link 
ON file_requests(share_link);

CREATE INDEX IF NOT EXISTS idx_file_requests_user_id 
ON file_requests(user_id);

-- ============================================
-- 5. REQUEST FILES TABLE (files uploaded via request)
-- ============================================

CREATE TABLE IF NOT EXISTS request_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES file_requests(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    size BIGINT NOT NULL,
    mime_type VARCHAR(100),
    s3_key VARCHAR(500) NOT NULL,
    uploaded_by_email VARCHAR(255),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for request files lookup
CREATE INDEX IF NOT EXISTS idx_request_files_request_id 
ON request_files(request_id);

-- ============================================
-- VERIFY TABLES CREATED
-- ============================================

-- Check existing tables structure
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name IN ('files', 'shares', 'users') ORDER BY table_name, ordinal_position;
