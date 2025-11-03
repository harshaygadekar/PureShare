/**
 * Database type definitions for Supabase tables
 */

export interface Share {
  id: string;
  share_link: string;
  password_hash: string | null;
  expires_at: string;
  created_at: string;
  file_count: number;
}

export interface File {
  id: string;
  share_id: string;
  filename: string;
  size: number;
  mime_type: string;
  s3_key: string;
  uploaded_at: string;
}

export interface InsertShare {
  share_link: string;
  password_hash?: string | null;
  expires_at: string;
  file_count?: number;
}

export interface InsertFile {
  share_id: string;
  filename: string;
  size: number;
  mime_type: string;
  s3_key: string;
}
