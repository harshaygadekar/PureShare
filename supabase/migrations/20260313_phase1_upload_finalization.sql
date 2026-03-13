-- Phase 1 hardening: pending/completed upload finalization and atomic counters

ALTER TABLE files
  ADD COLUMN IF NOT EXISTS upload_status TEXT NOT NULL DEFAULT 'pending'
  CHECK (upload_status IN ('pending', 'completed', 'failed'));

ALTER TABLE request_files
  ADD COLUMN IF NOT EXISTS upload_status TEXT NOT NULL DEFAULT 'pending'
  CHECK (upload_status IN ('pending', 'completed', 'failed'));

-- Existing rows were created before pending upload tracking existed.
UPDATE files
SET upload_status = 'completed'
WHERE upload_status = 'pending';

UPDATE request_files
SET upload_status = 'completed'
WHERE upload_status = 'pending';

CREATE INDEX IF NOT EXISTS idx_files_share_upload_status_uploaded_at
  ON files (share_id, upload_status, uploaded_at DESC);

CREATE INDEX IF NOT EXISTS idx_request_files_request_status_uploaded_at
  ON request_files (request_id, upload_status, uploaded_at DESC);

CREATE OR REPLACE FUNCTION finalize_share_file_upload(target_file_id UUID)
RETURNS TABLE (
  file_id UUID,
  share_id UUID,
  upload_status TEXT,
  file_count INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  affected_share_id UUID;
  affected_mime_type TEXT;
BEGIN
  UPDATE files
  SET upload_status = 'completed'
  WHERE id = target_file_id
    AND upload_status = 'pending'
  RETURNING files.share_id, files.mime_type
  INTO affected_share_id, affected_mime_type;

  IF FOUND THEN
    UPDATE shares
    SET
      file_count = file_count + 1,
      has_image = has_image OR (affected_mime_type LIKE 'image/%'),
      has_video = has_video OR (affected_mime_type LIKE 'video/%')
    WHERE id = affected_share_id;
  END IF;

  RETURN QUERY
  SELECT f.id, f.share_id, f.upload_status, s.file_count
  FROM files f
  JOIN shares s ON s.id = f.share_id
  WHERE f.id = target_file_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_file_download_count(target_file_id UUID)
RETURNS INTEGER
LANGUAGE sql
AS $$
  UPDATE files
  SET download_count = COALESCE(download_count, 0) + 1
  WHERE id = target_file_id
    AND upload_status = 'completed'
  RETURNING download_count;
$$;
