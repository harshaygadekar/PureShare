-- Add mixed-media metadata and expiration profile support for video sharing
ALTER TABLE shares
  ADD COLUMN IF NOT EXISTS has_image boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS has_video boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS expiration_profile text NOT NULL DEFAULT 'standard'
    CHECK (expiration_profile IN ('standard', 'video')),
  ADD COLUMN IF NOT EXISTS expiration_hours_selected integer;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'chk_files_size_positive'
  ) THEN
    ALTER TABLE files
      ADD CONSTRAINT chk_files_size_positive CHECK (size > 0);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_shares_user_created_at
  ON shares (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_shares_user_expires_at
  ON shares (user_id, expires_at DESC);

CREATE INDEX IF NOT EXISTS idx_shares_user_media_created_at
  ON shares (user_id, has_video, has_image, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_files_share_uploaded_at
  ON files (share_id, uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_files_share_video_uploaded_at
  ON files (share_id, uploaded_at DESC)
  WHERE mime_type LIKE 'video/%';
