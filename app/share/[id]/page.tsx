'use client';

/**
 * Share Viewing Page - Display files in a share
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FiDownload, FiLock, FiClock, FiFile, FiAlertCircle } from 'react-icons/fi';
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

  const downloadFile = async (fileId: string, filename: string) => {
    try {
      const response = await fetch(`/api/share/${shareId}/download/${fileId}`);

      if (!response.ok) {
        throw new Error('Failed to get download URL');
      }

      const { downloadUrl } = await response.json();

      // Create temporary link and trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading file:', err);
      alert('Failed to download file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
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
                onKeyPress={(e) => e.key === 'Enter' && verifyPassword()}
                placeholder="Enter password"
                disabled={isVerifying}
              />
            </div>

            {error && (
              <div className="bg-red-50 p-3 rounded-lg text-sm text-red-800 flex items-center gap-2">
                <FiAlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              onClick={verifyPassword}
              disabled={!password || isVerifying}
              className="w-full"
            >
              {isVerifying ? 'Verifying...' : 'Access Share'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error && !requiresPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <FiAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.href = '/'}>
              Create New Share
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
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
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Shared Files</h1>
          {shareInfo && (
            <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <FiFile className="w-4 h-4" />
                <span>{shareInfo.fileCount} files</span>
              </div>
              <div className="flex items-center gap-1">
                <FiClock className="w-4 h-4" />
                <span>Expires in {formatTimeRemaining(shareInfo.expiresAt)}</span>
              </div>
            </div>
          )}
        </div>

        {/* File Grid */}
        {files.length === 0 ? (
          <Card className="text-center p-8">
            <FiFile className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No files in this share</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <Card key={file.id} className="overflow-hidden hover:shadow-lg transition-shadow">
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
                <CardContent className="p-4">
                  <p className="font-medium truncate mb-1">{file.filename}</p>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{formatFileSize(file.size)}</span>
                    <Badge variant="secondary">{file.mimeType.split('/')[1]}</Badge>
                  </div>
                  <Button
                    onClick={() => downloadFile(file.id, file.filename)}
                    variant="outline"
                    size="sm"
                    className="w-full mt-3"
                  >
                    <FiDownload className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
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
                  className="w-full h-auto max-h-[70vh] object-contain"
                />
                <Button
                  onClick={() => downloadFile(selectedImage.id, selectedImage.filename)}
                  className="w-full"
                >
                  <FiDownload className="w-4 h-4 mr-2" />
                  Download {selectedImage.filename}
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
