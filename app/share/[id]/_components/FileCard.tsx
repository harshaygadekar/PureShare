/**
 * File Card Component
 * Individual file card with glassmorphism and hover animations
 */

'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { FiDownload, FiFile, FiImage, FiFileText, FiVideo, FiMusic } from 'react-icons/fi';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatBytes } from '@/lib/downloads/client-download';
import { downloadFile } from '@/lib/downloads/client-download';
import { toast } from 'sonner';
import type { FileMetadata } from '@/types/api';

interface FileCardProps {
  file: FileMetadata;
  shareId: string;
  onPreview?: (file: FileMetadata) => void;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FiImage;
  if (mimeType.startsWith('video/')) return FiVideo;
  if (mimeType.startsWith('audio/')) return FiMusic;
  if (mimeType.includes('pdf') || mimeType.includes('document')) return FiFileText;
  return FiFile;
}

function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : 'FILE';
}

export function FileCard({ file, shareId, onPreview }: FileCardProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const isImage = file.mimeType.startsWith('image/');
  const FileIcon = getFileIcon(file.mimeType);

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isDownloading) return;

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

  const handlePreview = () => {
    if (isImage && onPreview) {
      onPreview(file);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group overflow-hidden rounded-xl border border-border bg-surface/80 shadow-soft backdrop-blur-md transition-all hover:border-accent/50 hover:shadow-medium"
    >
      {/* Preview Area */}
      <div
        onClick={handlePreview}
        className={`relative aspect-video bg-elevated ${isImage ? 'cursor-pointer' : ''}`}
      >
        {isImage ? (
          <>
            <img
              src={file.previewUrl}
              alt={file.filename}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
              <div className="text-center">
                <FiImage className="mx-auto mb-2 h-8 w-8 text-accent" />
                <p className="text-sm font-medium text-foreground">Click to preview</p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center p-6">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-xl bg-accent/10">
              <FileIcon className="h-8 w-8 text-accent" />
            </div>
            <Badge variant="secondary" className="text-xs">
              {getFileExtension(file.filename)}
            </Badge>
          </div>
        )}

        {/* Download Progress Overlay */}
        {isDownloading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <div className="w-32">
              <div className="mb-2 text-center text-sm font-medium text-foreground">
                {Math.round(downloadProgress)}%
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-elevated">
                <motion.div
                  className="h-full bg-accent"
                  initial={{ width: 0 }}
                  animate={{ width: `${downloadProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Filename */}
        <h3 className="mb-2 truncate text-sm font-medium text-foreground" title={file.filename}>
          {file.filename}
        </h3>

        {/* Metadata */}
        <div className="mb-3 flex items-center justify-between text-xs text-secondary">
          <span>{formatBytes(file.size)}</span>
          <Badge variant="secondary" className="text-xs">
            {getFileExtension(file.filename)}
          </Badge>
        </div>

        {/* Download Button */}
        <Button
          onClick={handleDownload}
          disabled={isDownloading}
          variant="outline"
          size="sm"
          className="w-full"
        >
          <FiDownload className="h-4 w-4" />
          {isDownloading ? 'Downloading...' : 'Download'}
        </Button>
      </div>
    </motion.div>
  );
}
