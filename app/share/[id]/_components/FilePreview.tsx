/**
 * File Preview Modal
 * Full-screen image viewer with keyboard navigation
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiDownload, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { downloadFile } from '@/lib/downloads/client-download';
import { toast } from 'sonner';
import type { FileMetadata } from '@/types/api';

interface FilePreviewProps {
  file: FileMetadata | null;
  files: FileMetadata[];
  shareId: string;
  onClose: () => void;
  onNavigate?: (file: FileMetadata) => void;
}

export function FilePreview({ file, files, shareId, onClose, onNavigate }: FilePreviewProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  // Get current file index
  const currentIndex = file ? files.findIndex((f) => f.id === file.id) : -1;
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < files.length - 1;

  // Filter for image files only
  const imageFiles = files.filter((f) => f.mimeType.startsWith('image/'));
  const currentImageIndex = file ? imageFiles.findIndex((f) => f.id === file.id) : -1;
  const isImageFile = file?.mimeType.startsWith('image/');

  // Keyboard navigation
  useEffect(() => {
    if (!file) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrevious) {
        handlePrevious();
      } else if (e.key === 'ArrowRight' && hasNext) {
        handleNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [file, hasPrevious, hasNext]);

  const handlePrevious = () => {
    if (hasPrevious && onNavigate) {
      // Navigate to previous image file
      const prevImageIndex = currentImageIndex - 1;
      if (prevImageIndex >= 0) {
        onNavigate(imageFiles[prevImageIndex]);
      }
    }
  };

  const handleNext = () => {
    if (hasNext && onNavigate) {
      // Navigate to next image file
      const nextImageIndex = currentImageIndex + 1;
      if (nextImageIndex < imageFiles.length) {
        onNavigate(imageFiles[nextImageIndex]);
      }
    }
  };

  const handleDownload = async () => {
    if (!file || isDownloading) return;

    try {
      setIsDownloading(true);
      setDownloadProgress(0);

      // Get download URL from API
      const response = await fetch(`/api/share/${shareId}/download/${file.id}`);
      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const { downloadUrl } = await response.json();

      // Download file with progress
      await downloadFile(downloadUrl, file.filename, {
        onProgress: (progress) => {
          setDownloadProgress(progress.percentage);
        },
      });

      toast.success(`Downloaded ${file.filename}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  if (!file) return null;

  const hasPreviousImage = currentImageIndex > 0;
  const hasNextImage = currentImageIndex < imageFiles.length - 1;

  return (
    <Dialog open={!!file} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl p-0" showCloseButton={false}>
        <div className="relative flex h-[90vh] flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-surface/95 p-4 backdrop-blur-md">
            <div className="flex-1">
              <h2 className="truncate text-lg font-semibold text-foreground">{file.filename}</h2>
              {isImageFile && imageFiles.length > 1 && (
                <p className="text-sm text-secondary">
                  {currentImageIndex + 1} of {imageFiles.length}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Download Button */}
              <Button
                onClick={handleDownload}
                disabled={isDownloading}
                variant="outline"
                size="sm"
              >
                <FiDownload className="h-4 w-4" />
                {isDownloading ? `${Math.round(downloadProgress)}%` : 'Download'}
              </Button>

              {/* Close Button */}
              <Button onClick={onClose} variant="ghost" size="icon">
                <FiX className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Preview Area */}
          <div className="relative flex flex-1 items-center justify-center bg-background p-8">
            <AnimatePresence mode="wait">
              <motion.img
                key={file.id}
                src={file.previewUrl}
                alt={file.filename}
                className="max-h-full max-w-full rounded-lg object-contain"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              />
            </AnimatePresence>

            {/* Navigation Buttons */}
            {isImageFile && (
              <>
                {hasPreviousImage && (
                  <button
                    onClick={handlePrevious}
                    className="absolute left-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/95 backdrop-blur-md transition-all hover:scale-110 hover:border-accent hover:bg-accent hover:text-white"
                    aria-label="Previous image"
                  >
                    <FiChevronLeft className="h-6 w-6" />
                  </button>
                )}

                {hasNextImage && (
                  <button
                    onClick={handleNext}
                    className="absolute right-4 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-surface/95 backdrop-blur-md transition-all hover:scale-110 hover:border-accent hover:bg-accent hover:text-white"
                    aria-label="Next image"
                  >
                    <FiChevronRight className="h-6 w-6" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Footer with keyboard hints */}
          {isImageFile && imageFiles.length > 1 && (
            <div className="border-t border-border bg-surface/95 px-4 py-3 text-center text-sm text-secondary backdrop-blur-md">
              Use <kbd className="rounded border border-border bg-elevated px-2 py-1 text-xs">←</kbd>{' '}
              and <kbd className="rounded border border-border bg-elevated px-2 py-1 text-xs">→</kbd>{' '}
              to navigate, <kbd className="rounded border border-border bg-elevated px-2 py-1 text-xs">ESC</kbd> to close
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
