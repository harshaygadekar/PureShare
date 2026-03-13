/**
 * Client-side download utilities
 * Delegate downloads to the browser to avoid buffering large files in memory
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
 * Trigger a browser-managed file download without buffering in memory
 */
function triggerBrowserDownload(url: string, filename?: string): void {
  const link = document.createElement('a');
  link.href = url;
  if (filename) {
    link.download = filename;
  }
  link.rel = 'noopener noreferrer';
  link.style.display = 'none';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function downloadFile(
  url: string,
  filename: string,
  options: DownloadOptions = {}
): Promise<void> {
  const { onProgress, signal } = options;

  if (signal?.aborted) {
    throw new Error('Download cancelled');
  }

  triggerBrowserDownload(url, filename);
  onProgress?.({ loaded: 1, total: 1, percentage: 100 });
}

/**
 * Validate and trigger a browser-managed ZIP download
 */
export async function downloadAllAsZip(
  shareId: string,
  filename: string,
  options: DownloadOptions = {}
): Promise<void> {
  const { onProgress, signal } = options;

  try {
    const validationResponse = await fetch(`/api/share/${shareId}/download-all?validate=1`, {
      signal,
      credentials: 'include',
    });

    if (!validationResponse.ok) {
      const error = await validationResponse.json().catch(() => ({ message: 'Unknown error' }));
      throw new Error(error.message || 'Failed to create ZIP');
    }

    triggerBrowserDownload(`/api/share/${shareId}/download-all`, filename);
    onProgress?.({ loaded: 1, total: 1, percentage: 100 });

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
