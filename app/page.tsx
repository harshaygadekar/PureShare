'use client';

/**
 * Home Page - File Upload and Share Creation
 */

import { useState } from 'react';
import { FileUpload } from '@/components/features/file-upload';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { FiCopy, FiCheck, FiShare2 } from 'react-icons/fi';
import { APP_CONFIG, SHARE_CONFIG } from '@/config/constants';

export default function HomePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [password, setPassword] = useState('');
  const [expirationHours, setExpirationHours] = useState(SHARE_CONFIG.defaultExpirationHours.toString());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCreateShare = async () => {
    if (files.length === 0) {
      alert('Please select at least one file');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Step 1: Create share
      const createResponse = await fetch('/api/upload/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: password || undefined,
          expirationHours: parseInt(expirationHours),
        }),
      });

      if (!createResponse.ok) {
        throw new Error('Failed to create share');
      }

      const { shareLink: link } = await createResponse.json();

      // Step 2: Upload files
      const totalFiles = files.length;
      let uploadedFiles = 0;

      for (const file of files) {
        // Register file in database
        const registerResponse = await fetch('/api/upload/files', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            shareLink: link,
            filename: file.name,
            size: file.size,
            mimeType: file.type,
          }),
        });

        if (!registerResponse.ok) {
          throw new Error(`Failed to register file: ${file.name}`);
        }

        const { previewUrl } = await registerResponse.json();

        // Upload file to S3 using presigned URL
        await fetch(previewUrl, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': file.type,
          },
        });

        uploadedFiles++;
        setUploadProgress((uploadedFiles / totalFiles) * 100);
      }

      // Success - show share link
      const fullLink = `${APP_CONFIG.url}/share/${link}`;
      setShareLink(fullLink);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (shareLink) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Share Created!</CardTitle>
            <CardDescription>
              Your files are ready to share
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Share Link</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={shareLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="icon"
                >
                  {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800">
              <p className="font-medium mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Share will expire in {expirationHours} hours</li>
                {password && <li>Password protected</li>}
                <li>Files uploaded: {files.length}</li>
              </ul>
            </div>

            <Button
              onClick={() => {
                setShareLink('');
                setFiles([]);
                setPassword('');
                setUploadProgress(0);
              }}
              className="w-full"
            >
              Create Another Share
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <FiShare2 className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">{APP_CONFIG.name}</h1>
          </div>
          <p className="text-gray-600">{APP_CONFIG.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Upload & Share Files</CardTitle>
            <CardDescription>
              Create a temporary share link for your files
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FileUpload
              onFilesSelected={setFiles}
              disabled={isUploading}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password (Optional)</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expiration">Expiration</Label>
                <Select
                  value={expirationHours}
                  onValueChange={setExpirationHours}
                  disabled={isUploading}
                >
                  <SelectTrigger id="expiration">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24">24 hours</SelectItem>
                    <SelectItem value="48">48 hours</SelectItem>
                    <SelectItem value="72">3 days</SelectItem>
                    <SelectItem value="168">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}

            <Button
              onClick={handleCreateShare}
              disabled={files.length === 0 || isUploading}
              className="w-full"
              size="lg"
            >
              {isUploading ? 'Uploading...' : 'Create Share Link'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
