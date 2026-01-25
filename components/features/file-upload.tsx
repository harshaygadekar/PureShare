'use client';

/**
 * File Upload Component
 * Clean drag and drop with Apple-inspired design
 */

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { FiUploadCloud, FiFile, FiX, FiImage } from 'react-icons/fi';
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
    const fileToRemove = selectedFiles[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  useEffect(() => {
    return () => {
      selectedFiles.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [selectedFiles]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const rootProps = getRootProps();

  return (
    <div className="w-full space-y-4">
      {/* Drop Zone */}
      <div
        {...rootProps}
        className="relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200 cursor-pointer"
        style={{
          borderColor: isDragActive
            ? 'var(--color-interactive)'
            : 'var(--color-border)',
          backgroundColor: isDragActive
            ? 'rgba(0, 113, 227, 0.05)'
            : 'var(--color-bg-secondary)',
          transform: isDragActive ? 'scale(1.01)' : 'scale(1)',
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? 'none' : 'auto',
        }}
      >
        <input {...getInputProps()} />

        <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-200"
            style={{
              backgroundColor: 'var(--color-bg-primary)',
              transform: isDragActive ? 'scale(1.1)' : 'scale(1)',
            }}
          >
            <FiUploadCloud
              className="h-7 w-7"
              style={{ color: 'var(--color-interactive)' }}
            />
          </div>

          <div>
            <p
              className="text-base font-medium"
              style={{ color: 'var(--color-text-primary)' }}
            >
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </p>
            {!isDragActive && (
              <p
                className="text-sm mt-1"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                or click to select files
              </p>
            )}
          </div>

          <p
            className="text-xs"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            Max {FILE_CONFIG.maxFilesPerShare} files, up to{' '}
            {Math.round(FILE_CONFIG.maxFileSize / 1024 / 1024)}MB each
          </p>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <p
            className="text-sm font-medium flex items-center gap-2"
            style={{ color: 'var(--color-text-primary)' }}
          >
            <FiImage className="h-4 w-4" style={{ color: 'var(--color-interactive)' }} />
            Selected files ({selectedFiles.length})
          </p>

          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg transition-colors duration-150"
                style={{
                  backgroundColor: 'var(--color-bg-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-10 h-10 object-cover rounded-lg"
                      style={{ border: '1px solid var(--color-border)' }}
                    />
                  ) : (
                    <div
                      className="w-10 h-10 flex items-center justify-center rounded-lg"
                      style={{ backgroundColor: 'var(--color-bg-primary)' }}
                    >
                      <FiFile className="w-5 h-5" style={{ color: 'var(--color-interactive)' }} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--color-text-primary)' }}
                    >
                      {file.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: 'var(--color-text-tertiary)' }}
                    >
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  disabled={disabled}
                  className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500"
                >
                  <FiX className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
