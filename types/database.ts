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
  has_image: boolean;
  has_video: boolean;
  expiration_profile: "standard" | "video";
  expiration_hours_selected: number | null;
  user_id: string | null;
  title: string | null;
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
  has_image?: boolean;
  has_video?: boolean;
  expiration_profile?: "standard" | "video";
  expiration_hours_selected?: number | null;
  user_id?: string | null;
  title?: string | null;
}

export interface InsertFile {
  share_id: string;
  filename: string;
  size: number;
  mime_type: string;
  s3_key: string;
}

export interface UserStats {
  totalShares: number;
  activeShares: number;
  expiredShares: number;
}

export interface ShareWithFiles extends Share {
  files: File[];
}
