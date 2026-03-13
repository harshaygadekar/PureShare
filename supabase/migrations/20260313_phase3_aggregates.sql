-- Phase 3 performance helpers: aggregate request counts and share analytics

CREATE OR REPLACE FUNCTION get_user_request_upload_counts(target_user_id UUID)
RETURNS TABLE (
  request_id UUID,
  uploaded_files_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    fr.id AS request_id,
    COUNT(rf.id)::BIGINT AS uploaded_files_count
  FROM file_requests fr
  LEFT JOIN request_files rf
    ON rf.request_id = fr.id
   AND rf.upload_status = 'completed'
  WHERE fr.user_id = target_user_id
  GROUP BY fr.id;
$$;

CREATE OR REPLACE FUNCTION get_share_analytics_overview(
  target_share_id UUID,
  from_ts TIMESTAMPTZ DEFAULT NULL,
  to_ts TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  total_views BIGINT,
  unique_visitors BIGINT,
  total_downloads BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    COUNT(*) FILTER (WHERE event_type = 'view')::BIGINT AS total_views,
    COUNT(DISTINCT NULLIF(ip_hash, ''))::BIGINT AS unique_visitors,
    COUNT(*) FILTER (WHERE event_type = 'download_file')::BIGINT AS total_downloads
  FROM share_analytics
  WHERE share_id = target_share_id
    AND (from_ts IS NULL OR created_at >= from_ts)
    AND (to_ts IS NULL OR created_at <= to_ts);
$$;

CREATE OR REPLACE FUNCTION get_share_file_download_counts(
  target_share_id UUID,
  from_ts TIMESTAMPTZ DEFAULT NULL,
  to_ts TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  filename VARCHAR,
  download_count BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    f.id,
    f.filename,
    COUNT(sa.id)::BIGINT AS download_count
  FROM files f
  LEFT JOIN share_analytics sa
    ON sa.file_id = f.id
   AND sa.share_id = target_share_id
   AND sa.event_type = 'download_file'
   AND (from_ts IS NULL OR sa.created_at >= from_ts)
   AND (to_ts IS NULL OR sa.created_at <= to_ts)
  WHERE f.share_id = target_share_id
    AND f.upload_status = 'completed'
  GROUP BY f.id, f.filename, f.uploaded_at
  ORDER BY f.uploaded_at DESC;
$$;

CREATE OR REPLACE FUNCTION get_share_analytics_timeline(
  target_share_id UUID,
  from_ts TIMESTAMPTZ DEFAULT NULL,
  to_ts TIMESTAMPTZ DEFAULT NULL
)
RETURNS TABLE (
  date DATE,
  views BIGINT,
  downloads BIGINT
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    DATE(created_at) AS date,
    COUNT(*) FILTER (WHERE event_type = 'view')::BIGINT AS views,
    COUNT(*) FILTER (WHERE event_type = 'download_file')::BIGINT AS downloads
  FROM share_analytics
  WHERE share_id = target_share_id
    AND (from_ts IS NULL OR created_at >= from_ts)
    AND (to_ts IS NULL OR created_at <= to_ts)
  GROUP BY DATE(created_at)
  ORDER BY DATE(created_at);
$$;
