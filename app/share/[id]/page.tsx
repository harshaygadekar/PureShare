'use client';

/**
 * Share Viewing Page - Display files in a share
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { FiDownload, FiLock, FiClock, FiFile, FiAlertCircle } from 'react-icons/fi';
import { motion } from 'framer-motion';
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background via-surface/30 to-background">
        <Card className="w-full max-w-md glass-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiLock className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Password Required</CardTitle>
            <CardDescription>
              This share is password protected
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
                className="glass-input"
              />
            </div>

            {error && (
              <div className="bg-red-50 p-3 rounded-lg text-sm text-red-800 flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <LiquidButton
              onClick={verifyPassword}
              disabled={!password || isVerifying}
              className="w-full"
            >
              {isVerifying ? 'Verifying...' : 'Access Share'}
            </LiquidButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background via-surface/30 to-background">
        <Card className="w-full max-w-md text-center glass-card">
          <CardContent className="pt-6">
            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <LiquidButton onClick={() => window.location.href = '/'}>
              Create New Share
            </LiquidButton>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-b from-background via-surface/30 to-background">
        <div className="max-w-6xl mx-auto py-8">
          <Skeleton className="h-12 w-64 mx-auto mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-b from-background via-surface/30 to-background">
      <div className="max-w-7xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-2 text-white">Shared Files</h1>
          </motion.div>

          {shareInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-6 text-sm text-white/70"
            >
              <div className="flex items-center gap-2">
                <FiFile className="w-4 h-4" />
                <span>{shareInfo.fileCount} files ({formatBytes(calculateTotalSize(files))})</span>
              </div>
              <div className="flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                <span>Expires in {formatTimeRemaining(shareInfo.expiresAt)}</span>
              </div>
            </motion.div>
          )}

          {/* Download All Button */}
          {files.length > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <LiquidButton
                onClick={handleDownloadAll}
                disabled={isDownloadingAll}
                size="lg"
                className="group shadow-medium hover:shadow-strong"
              >
                {isDownloadingAll ? (
                  <div className="flex items-center gap-3">
                    <Progress value={downloadAllProgress} className="w-24 h-2" />
                    <span>{Math.round(downloadAllProgress)}%</span>
                  </div>
                ) : (
                  <>
                    <FiDownload className="w-5 h-5 mr-2" />
                    Download All ({files.length} files, {formatBytes(calculateTotalSize(files))})
                  </>
                )}
              </LiquidButton>
            </motion.div>
          )}
        </div>

        {/* File Grid */}
        {files.length === 0 ? (
          <Card className="text-center p-8 glass-card">
            <FiFile className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/60">No files in this share</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <motion.div
                key={file.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                <Card className="overflow-hidden glass-card hover:shadow-2xl transition-all duration-300 h-full flex flex-col">
                  <div
                    className="relative h-48 bg-gray-100 cursor-pointer"
                    onClick={() => setSelectedImage(file)}
                  >
                    <img
                      src={file.previewUrl}
                      alt={file.filename}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-4 flex-1 flex flex-col">
                    <p className="font-medium truncate mb-1" title={file.filename}>
                      {file.filename}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <span>{formatBytes(file.size)}</span>
                      <Badge variant="secondary">{file.mimeType.split('/')[1].toUpperCase()}</Badge>
                    </div>
                    <LiquidButton
                      onClick={() => handleDownloadFile(file)}
                      disabled={downloadingFileId === file.id}
                      variant="outline"
                      size="sm"
                      className="w-full group mt-auto"
                    >
                      {downloadingFileId === file.id ? (
                        <div className="flex items-center gap-2 w-full">
                          <Progress value={downloadProgress} className="w-16 h-1.5" />
                          <span className="text-xs">{Math.round(downloadProgress)}%</span>
                        </div>
                      ) : (
                        <>
                          <FiDownload className="w-4 h-4 mr-2 group-hover:translate-y-0.5 transition-transform" />
                          Download
                        </>
                      )}
                    </LiquidButton>
                  </CardContent>
                </Card>
              </motion.div>
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
                <img
                  src={selectedImage.previewUrl}
                  alt={selectedImage.filename}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
                />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{formatBytes(selectedImage.size)}</span>
                  <Badge variant="secondary">{selectedImage.mimeType}</Badge>
                </div>
                <LiquidButton
                  onClick={() => handleDownloadFile(selectedImage)}
                  disabled={downloadingFileId === selectedImage.id}
                  className="w-full"
                  size="lg"
                >
                  {downloadingFileId === selectedImage.id ? (
                    <div className="flex items-center gap-3">
                      <Progress value={downloadProgress} className="w-32 h-2" />
                      <span>{Math.round(downloadProgress)}%</span>
                    </div>
                  ) : (
                    <>
                      <FiDownload className="w-5 h-5 mr-2" />
                      Download {selectedImage.filename}
                    </>
                  )}
                </LiquidButton>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
