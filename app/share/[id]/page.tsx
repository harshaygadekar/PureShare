'use client';

/**
 * Share Viewing Page
 * Clean Apple-inspired design for viewing and downloading shared files
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FiDownload, FiLock, FiClock, FiFile, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { toast } from 'sonner';
import { downloadFile, downloadAllAsZip, formatBytes, calculateTotalSize } from '@/lib/downloads/client-download';
import type { FileMetadata } from '@/types/api';

export default function SharePage() {
  const params = useParams();
  const shareId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [shareInfo, setShareInfo] = useState<{ expiresAt: string; fileCount: number } | null>(null);
  const [selectedImage, setSelectedImage] = useState<FileMetadata | null>(null);
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [downloadAllProgress, setDownloadAllProgress] = useState(0);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [dialogImageLoaded, setDialogImageLoaded] = useState(false);

  useEffect(() => {
    checkShareAccess();
  }, [shareId]);

  const checkShareAccess = async () => {
    try {
      const response = await fetch(`/api/share/${shareId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await response.json();

      if (response.status === 401 && data.message === 'Password required') {
        setRequiresPassword(true);
        setIsLoading(false);
        return;
      }

      if (response.status === 410) {
        setError('This share has expired');
        setIsLoading(false);
        return;
      }

      if (response.status === 404) {
        setError('Share not found');
        setIsLoading(false);
        return;
      }

      if (response.ok) {
        await loadFiles();
      }
    } catch (err) {
      console.error('Error checking share access:', err);
      setError('Failed to load share');
      setIsLoading(false);
    }
  };

  const verifyPassword = async () => {
    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch(`/api/share/${shareId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (response.status === 401) {
        setError('Invalid password');
        setIsVerifying(false);
        return;
      }

      if (response.ok) {
        setRequiresPassword(false);
        await loadFiles();
      }
    } catch (err) {
      console.error('Error verifying password:', err);
      setError('Failed to verify password');
    } finally {
      setIsVerifying(false);
    }
  };

  const loadFiles = async () => {
    try {
      const response = await fetch(`/api/share/${shareId}/files`);

      if (!response.ok) {
        throw new Error('Failed to load files');
      }

      const data = await response.json();
      setFiles(data.files);
      setShareInfo(data.shareInfo);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading files:', err);
      setError('Failed to load files');
      setIsLoading(false);
    }
  };

  const handleDownloadFile = async (file: FileMetadata) => {
    try {
      setDownloadingFileId(file.id);
      setDownloadProgress(0);

      const response = await fetch(`/api/share/${shareId}/download/${file.id}`);
      if (!response.ok) throw new Error('Failed to get download URL');

      const { downloadUrl } = await response.json();

      await downloadFile(downloadUrl, file.filename, {
        onProgress: (progress) => setDownloadProgress(progress.percentage),
      });

      toast.success(`Downloaded ${file.filename}`);
    } catch (err) {
      toast.error('Failed to download file');
    } finally {
      setDownloadingFileId(null);
      setDownloadProgress(0);
    }
  };

  const handleDownloadAll = async () => {
    try {
      setIsDownloadingAll(true);
      setDownloadAllProgress(0);

      await downloadAllAsZip(shareId, `pureshare-${shareId}.zip`, {
        onProgress: (progress) => setDownloadAllProgress(progress.percentage),
      });

      toast.success('All files downloaded successfully!');
    } catch (err) {
      toast.error('Failed to download files');
    } finally {
      setIsDownloadingAll(false);
      setDownloadAllProgress(0);
    }
  };

  const formatTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff < 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? 's' : ''}`;
    }

    return `${hours}h ${minutes}m`;
  };

  // Password prompt
  if (requiresPassword) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        <div
          className="w-full max-w-md rounded-2xl p-8"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-medium)',
          }}
        >
          {/* Icon */}
          <div className="text-center mb-6">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(0, 113, 227, 0.1)' }}
            >
              <FiLock className="w-8 h-8" style={{ color: 'var(--color-interactive)' }} />
            </div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: 'var(--color-text-primary)' }}
            >
              Password Required
            </h1>
            <p
              className="mt-2 text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              This share is password protected
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Enter Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && verifyPassword()}
                placeholder="Enter password"
                disabled={isVerifying}
              />
            </div>

            {error && (
              <div
                className="p-3 rounded-lg text-sm flex items-center gap-2"
                style={{
                  backgroundColor: 'rgba(255, 59, 48, 0.1)',
                  color: 'var(--color-error)',
                }}
              >
                <FiAlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              onClick={verifyPassword}
              disabled={!password || isVerifying}
              className="w-full"
              size="lg"
            >
              {isVerifying ? 'Verifying...' : 'Access Share'}
              {!isVerifying && <FiArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !requiresPassword) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-medium)',
          }}
        >
          <FiAlertCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: 'var(--color-error)' }}
          />
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Error
          </h2>
          <p
            className="mb-6"
            style={{ color: 'var(--color-text-secondary)' }}
          >
            {error}
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Create New Share
          </Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen p-4"
        style={{ backgroundColor: 'var(--color-bg-primary)' }}
      >
        <div className="max-w-6xl mx-auto py-8">
          <Skeleton className="h-12 w-64 mx-auto mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main content - Files view
  return (
    <div
      className="min-h-screen p-4"
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
    >
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1
            className="text-4xl font-bold mb-4"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Shared Files
          </h1>

          {shareInfo && (
            <div
              className="flex items-center justify-center gap-6 text-sm"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              <div className="flex items-center gap-2">
                <FiFile className="w-4 h-4" />
                <span>{shareInfo.fileCount} files ({formatBytes(calculateTotalSize(files))})</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                <span>Expires in {formatTimeRemaining(shareInfo.expiresAt)}</span>
              </div>
            </div>
          )}

          {/* Download All Button */}
          {files.length > 1 && (
            <div className="mt-6">
              <Button
                onClick={handleDownloadAll}
                disabled={isDownloadingAll}
                size="lg"
              >
                {isDownloadingAll ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⟳</span>
                    {Math.round(downloadAllProgress)}%
                  </span>
                ) : (
                  <>
                    <FiDownload className="w-5 h-5 mr-2" />
                    Download All ({files.length} files)
                  </>
                )}
              </Button>
            </div>
          )}
        </div>

        {/* File Grid */}
        {files.length === 0 ? (
          <div
            className="text-center p-12 rounded-2xl"
            style={{
              backgroundColor: 'var(--color-bg-elevated)',
              border: '1px solid var(--color-border)',
            }}
          >
            <FiFile
              className="w-16 h-16 mx-auto mb-4"
              style={{ color: 'var(--color-text-tertiary)' }}
            />
            <p style={{ color: 'var(--color-text-secondary)' }}>
              No files in this share
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {files.map((file) => (
              <div
                key={file.id}
                className="rounded-xl overflow-hidden transition-all duration-200 hover:shadow-lg"
                style={{
                  backgroundColor: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {/* Image Preview with Progressive Loading */}
                <div
                  className="relative h-48 cursor-pointer overflow-hidden"
                  style={{ backgroundColor: 'var(--color-bg-secondary)' }}
                  onClick={() => {
                    setDialogImageLoaded(false);
                    setSelectedImage(file);
                  }}
                >
                  {/* Skeleton Placeholder */}
                  {!loadedImages.has(file.id) && (
                    <div className="absolute inset-0 animate-pulse" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                      <div className="flex items-center justify-center h-full">
                        <FiFile className="w-8 h-8" style={{ color: 'var(--color-text-tertiary)' }} />
                      </div>
                    </div>
                  )}
                  <img
                    src={file.previewUrl}
                    alt={file.filename}
                    loading="lazy"
                    onLoad={() => setLoadedImages(prev => new Set(prev).add(file.id))}
                    className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                    style={{
                      opacity: loadedImages.has(file.id) ? 1 : 0,
                      transform: loadedImages.has(file.id) ? 'scale(1)' : 'scale(1.02)',
                    }}
                  />
                </div>

                {/* File Info */}
                <div className="p-4">
                  <p
                    className="font-medium truncate mb-1"
                    style={{ color: 'var(--color-text-primary)' }}
                    title={file.filename}
                  >
                    {file.filename}
                  </p>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span style={{ color: 'var(--color-text-tertiary)' }}>
                      {formatBytes(file.size)}
                    </span>
                    <Badge variant="secondary">
                      {file.mimeType.split('/')[1].toUpperCase()}
                    </Badge>
                  </div>
                  <Button
                    onClick={() => handleDownloadFile(file)}
                    disabled={downloadingFileId === file.id}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {downloadingFileId === file.id ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⟳</span>
                        {Math.round(downloadProgress)}%
                      </span>
                    ) : (
                      <>
                        <FiDownload className="w-4 h-4 mr-2" />
                        Download
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Image Preview Dialog */}
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedImage?.filename}</DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <div className="space-y-4">
                {/* Dialog Image with Loading State */}
                <div className="relative w-full max-h-[70vh] rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--color-bg-secondary)' }}>
                  {!dialogImageLoaded && (
                    <div className="absolute inset-0 animate-pulse flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg-tertiary)', minHeight: '300px' }}>
                      <div className="text-center">
                        <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3" style={{ borderColor: 'var(--color-interactive)', borderTopColor: 'transparent' }} />
                        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>Loading full image...</p>
                      </div>
                    </div>
                  )}
                  <img
                    src={selectedImage.previewUrl}
                    alt={selectedImage.filename}
                    onLoad={() => setDialogImageLoaded(true)}
                    className="w-full h-auto max-h-[70vh] object-contain transition-opacity duration-300"
                    style={{ opacity: dialogImageLoaded ? 1 : 0 }}
                  />
                </div>
                <div className="flex items-center justify-between text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                  <span>{formatBytes(selectedImage.size)}</span>
                  <Badge variant="secondary">{selectedImage.mimeType}</Badge>
                </div>
                <Button
                  onClick={() => handleDownloadFile(selectedImage)}
                  disabled={downloadingFileId === selectedImage.id}
                  className="w-full"
                  size="lg"
                >
                  {downloadingFileId === selectedImage.id ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⟳</span>
                      {Math.round(downloadProgress)}%
                    </span>
                  ) : (
                    <>
                      <FiDownload className="w-5 h-5 mr-2" />
                      Download {selectedImage.filename}
                    </>
                  )}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
