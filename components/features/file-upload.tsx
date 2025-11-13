'use client';

/**
 * File Upload Component with Revolutionary Drag and Drop
 * Magical interactions with Framer Motion
 */

import { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { FiUploadCloud, FiFile, FiX, FiImage } from 'react-icons/fi';
import { FILE_CONFIG } from '@/config/constants';
import { motion, AnimatePresence } from 'framer-motion';

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
    // Revoke the object URL before removing to prevent memory leak
    const fileToRemove = selectedFiles[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    onFilesSelected(newFiles);
  };

  // Cleanup: Revoke all object URLs on component unmount
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
      <div
        {...rootProps}
        className={`relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer glass-card ${
          isDragActive
            ? 'border-accent/50 scale-[1.02] shadow-2xl'
            : 'border-white/10 hover:border-accent/30'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <input {...getInputProps()} />

        {/* Background animation */}
        <AnimatePresence>
          {isDragActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-accent/20 to-accent/5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        <div className="relative p-12 flex flex-col items-center justify-center text-center space-y-4">
          <motion.div
            animate={{
              y: isDragActive ? -10 : 0,
              scale: isDragActive ? 1.2 : 1,
            }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="relative">
              <motion.div
                className="absolute inset-0 rounded-full bg-accent/20 blur-xl"
                animate={{
                  scale: isDragActive ? [1, 1.5, 1] : 1,
                  opacity: isDragActive ? [0.5, 1, 0.5] : 0,
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <FiUploadCloud className="relative w-16 h-16 text-accent" />
            </div>
          </motion.div>

          <div>
            <motion.p
              className="text-lg font-semibold text-white"
              animate={{ y: isDragActive ? -5 : 0 }}
            >
              {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
            </motion.p>
            <motion.p
              className="text-sm text-white/70 mt-2"
              animate={{ opacity: isDragActive ? 0 : 1 }}
            >
              or click to select files
            </motion.p>
          </div>

          <motion.p
            className="text-xs text-white/50"
            animate={{ opacity: isDragActive ? 0 : 1 }}
          >
            Max {FILE_CONFIG.maxFilesPerShare} files, up to{' '}
            {Math.round(FILE_CONFIG.maxFileSize / 1024 / 1024)}MB each
          </motion.p>
        </div>

        {/* Animated border shine */}
        {!isDragActive && !disabled && (
          <motion.div
            className="absolute inset-0 rounded-xl opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, var(--accent)/20, transparent)',
            }}
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      <AnimatePresence>
        {selectedFiles.length > 0 && (
          <motion.div
            className="space-y-3"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.p
              className="text-sm font-semibold text-white flex items-center gap-2"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <FiImage className="h-4 w-4 text-accent" />
              Selected files ({selectedFiles.length})
            </motion.p>

            <div className="space-y-2">
              {selectedFiles.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <Card className="p-3 glass-subtle hover:glass transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ type: "spring", stiffness: 400 }}
                        >
                          {file.preview ? (
                            <img
                              src={file.preview}
                              alt={file.name}
                              className="w-12 h-12 object-cover rounded-lg border border-white/10"
                            />
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center glass-subtle rounded-lg">
                              <FiFile className="w-6 h-6 text-accent" />
                            </div>
                          )}
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate text-white">
                            {file.name}
                          </p>
                          <p className="text-xs text-white/50">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <LiquidButton
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(index);
                          }}
                          disabled={disabled}
                          className="hover:bg-error/10 hover:text-error h-8 w-8 p-0"
                        >
                          <FiX className="w-4 h-4" />
                        </LiquidButton>
                      </motion.div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
