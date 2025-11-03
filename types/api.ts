/**
 * API request and response type definitions
 */

export interface CreateShareRequest {
  password?: string;
  expirationHours?: number;
}

export interface CreateShareResponse {
  shareLink: string;
  expiresAt: string;
  shareId: string;
}

export interface UploadFileRequest {
  shareLink: string;
  file: File;
}

export interface UploadFileResponse {
  fileId: string;
  filename: string;
  size: number;
  previewUrl: string;
}

export interface VerifyShareRequest {
  shareLink: string;
  password?: string;
}

export interface VerifyShareResponse {
  valid: boolean;
  requiresPassword: boolean;
  expiresAt: string;
  fileCount: number;
}

export interface GetFilesResponse {
  files: FileMetadata[];
  shareInfo: {
    expiresAt: string;
    fileCount: number;
  };
}

export interface FileMetadata {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  previewUrl: string;
}

export interface DownloadUrlResponse {
  downloadUrl: string;
  filename: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}
