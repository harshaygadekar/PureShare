/**
 * Client-side reliable download utilities
 * Solves cross-origin download issues with presigned URLs
 */

export interface DownloadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface DownloadOptions {
  onProgress?: (progress: DownloadProgress) => void;
  signal?: AbortSignal;
}

/**
 * Download a file reliably using fetch + Blob
 * Works around cross-origin issues with presigned URLs
 */
export async function downloadFile(
  url: string,
  filename: string,
  options: DownloadOptions = {}
): Promise<void> {
  const { onProgress, signal } = options;

  try {
    // Fetch the file
    const response = await fetch(url, { signal });

    if (!response.ok) {
      throw new Error(`Failed to download file: ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('Response body is empty');
    }

    // Get content length for progress tracking
    const contentLength = response.headers.get('Content-Length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    // Read the stream with progress tracking
    const reader = response.body.getReader();
    const chunks: BlobPart[] = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      loaded += value.length;

      // Report progress
      if (onProgress && total > 0) {
        onProgress({
          loaded,
          total,
          percentage: (loaded / total) * 100,
        });
      }
    }

    // Create blob from chunks
    const blob = new Blob(chunks);

    // Create object URL and trigger download
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 100);

  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Download cancelled');
      }
      throw new Error(`Download failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Download multiple files as a ZIP
 * Fetches the ZIP from the server and triggers download
 */
export async function downloadAllAsZip(
  shareId: string,
  filename: string,
  options: DownloadOptions = {}
): Promise<void> {
  const { onProgress, signal } = options;

  try {
    // Fetch the ZIP from the API
    const response = await fetch(`/api/share/${shareId}/download-all`, { signal });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || 'Failed to create ZIP');
    }

    if (!response.body) {
      throw new Error('Response body is empty');
    }

    // Get content length for progress tracking
    const contentLength = response.headers.get('Content-Length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    // Read the stream with progress tracking
    const reader = response.body.getReader();
    const chunks: BlobPart[] = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      chunks.push(value);
      loaded += value.length;

      // Report progress
      if (onProgress && total > 0) {
        onProgress({
          loaded,
          total,
          percentage: (loaded / total) * 100,
        });
      }
    }

    // Create blob from chunks
    const blob = new Blob(chunks, { type: 'application/zip' });

    // Create object URL and trigger download
    const blobUrl = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    link.style.display = 'none';

    document.body.appendChild(link);
    link.click();

    // Cleanup
    setTimeout(() => {
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 100);

  } catch (error) {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Download cancelled');
      }
      throw error;
    }
    throw new Error('Download failed');
  }
}

/**
 * Format bytes to human-readable size
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Calculate total size of files
 */
export function calculateTotalSize(files: Array<{ size: number }>): number {
  return files.reduce((total, file) => total + file.size, 0);
}
