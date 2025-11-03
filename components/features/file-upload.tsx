'use client';

/**
 * File Upload Component with Drag and Drop
 * Uses react-dropzone and shadcn/ui components
 */

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FiUploadCloud, FiFile, FiX } from 'react-icons/fi';
import { FILE_CONFIG } from '@/config/constants';

interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function FileUpload({ onFilesSelected, disabled }: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const filesWithPreview = acceptedFiles.map((file) =>
      Object.assign(file, {
        preview: URL.createObjectURL(file),
      })
    );

    setSelectedFiles((prev) => [...prev, ...filesWithPreview]);
    onFilesSelected([...selectedFiles, ...filesWithPreview]);
  }, [selectedFiles, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': FILE_CONFIG.allowedTypes.map(type => `.${type.split('/')[1]}`),
    },
    maxSize: FILE_CONFIG.maxFileSize,
    maxFiles: FILE_CONFIG.maxFilesPerShare,
    disabled,
  });

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="w-full space-y-4">
      <Card
        {...getRootProps()}
        className={`border-2 border-dashed transition-colors cursor-pointer p-8 ${
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-gray-300 hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <FiUploadCloud className="w-12 h-12 text-gray-400" />
          <div>
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              or click to select files
            </p>
          </div>
          <p className="text-xs text-gray-400">
            Max {FILE_CONFIG.maxFilesPerShare} files, up to{' '}
            {Math.round(FILE_CONFIG.maxFileSize / 1024 / 1024)}MB each
          </p>
        </div>
      </Card>

      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Selected files ({selectedFiles.length})
          </p>
          {selectedFiles.map((file, index) => (
            <Card key={index} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <FiFile className="w-10 h-10 text-gray-400" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                >
                  <FiX className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
