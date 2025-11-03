/**
 * AWS S3 client configuration and utilities
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AWS_CONFIG } from '@/config/constants';

// Initialize S3 client
export const s3Client = new S3Client({
  region: AWS_CONFIG.region,
  credentials: {
    accessKeyId: AWS_CONFIG.accessKeyId,
    secretAccessKey: AWS_CONFIG.secretAccessKey,
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
    Bucket: AWS_CONFIG.bucketName,
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
  expiresIn: number = 3600
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: AWS_CONFIG.bucketName,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Delete a single file from S3
 */
export async function deleteFile(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: AWS_CONFIG.bucketName,
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
    Bucket: AWS_CONFIG.bucketName,
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
  return `uploads/${shareId}/${sanitized}`;
}
