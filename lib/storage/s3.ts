/**
 * AWS S3 client configuration and utilities
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import { getEnvConfig } from '@/lib/utils/env-validation';

const env = getEnvConfig();

// Initialize S3 client
export const s3Client = new S3Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Generate a presigned URL for uploading a file to S3
 */
export async function getUploadPresignedUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Generate a presigned URL for downloading a file from S3
 */
export async function getDownloadPresignedUrl(
  key: string,
  expiresIn: number = 3600,
  downloadFilename?: string,
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
    ...(downloadFilename
      ? {
          ResponseContentDisposition: `attachment; filename*=UTF-8''${encodeURIComponent(downloadFilename)}`,
        }
      : {}),
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a single file from S3
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Delete multiple files from S3
 */
export async function deleteFiles(keys: string[]): Promise<void> {
  if (keys.length === 0) return;

  const command = new DeleteObjectsCommand({
    Bucket: env.AWS_S3_BUCKET_NAME,
    Delete: {
      Objects: keys.map(key => ({ Key: key })),
    },
  });

  await s3Client.send(command);
}

/**
 * Generate S3 key for a file
 */
export function generateS3Key(shareId: string, filename: string): string {
  // Sanitize filename to prevent issues
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  return `uploads/${shareId}/${randomUUID()}-${sanitized}`;
}

/**
 * Generate S3 key for a request file
 */
export function getS3KeyForRequestFile(requestId: string, filename: string): string {
  // Sanitize filename to prevent issues
  const sanitized = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
  const timestamp = Date.now();
  return `requests/${requestId}/${timestamp}-${sanitized}`;
}
