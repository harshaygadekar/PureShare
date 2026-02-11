"use client";

/**
 * File Upload Component
 * Clean drag and drop with Apple-inspired design
 */

import { useCallback, useState, useEffect } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { Button } from "@/components/ui/button";
import { FiUploadCloud, FiFile, FiX, FiImage, FiVideo } from "react-icons/fi";
import {
  FILE_CONFIG,
  getMediaKindFromMimeType,
  getMaxFileSizeForMimeType,
} from "@/config/constants";

interface FileWithPreview extends File {
  preview?: string;
}

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  onValidationError?: (message: string) => void;
  disabled?: boolean;
}

const imageAcceptConfig = Object.fromEntries(
  FILE_CONFIG.allowedImageTypes.map((mimeType) => [mimeType, [] as string[]]),
);

const videoAcceptConfig = Object.fromEntries(
  FILE_CONFIG.allowedVideoTypes.map((mimeType) => [mimeType, [] as string[]]),
);

export function FileUpload({
  onFilesSelected,
  onValidationError,
  disabled,
}: FileUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);

  const updateSelectedFiles = useCallback(
    (updater: (previous: FileWithPreview[]) => FileWithPreview[]) => {
      setSelectedFiles((previous) => {
        const nextFiles = updater(previous);
        onFilesSelected(nextFiles);
        return nextFiles;
      });
    },
    [onFilesSelected],
  );

  const validateFiles = useCallback(
    (files: File[]): { valid: FileWithPreview[]; errors: string[] } => {
      const errors: string[] = [];
      const validFiles: FileWithPreview[] = [];

      for (const file of files) {
        const mediaKind = getMediaKindFromMimeType(file.type);

        if (mediaKind === "unknown") {
          errors.push(`${file.name}: unsupported file type.`);
          continue;
        }

        const maxSize = getMaxFileSizeForMimeType(file.type);
        if (file.size > maxSize) {
          const maxMb = Math.round(maxSize / 1024 / 1024);
          errors.push(`${file.name}: exceeds ${maxMb}MB ${mediaKind} limit.`);
          continue;
        }

        validFiles.push(
          Object.assign(file, {
            preview:
              mediaKind === "image" ? URL.createObjectURL(file) : undefined,
          }) as FileWithPreview,
        );
      }

      return { valid: validFiles, errors };
    },
    [],
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const { valid, errors } = validateFiles(acceptedFiles);

      if (errors.length > 0) {
        onValidationError?.(errors[0]);
      } else {
        onValidationError?.("");
      }

      if (valid.length === 0) {
        return;
      }

      updateSelectedFiles((previous) => [...previous, ...valid]);
    },
    [validateFiles, onValidationError, updateSelectedFiles],
  );

  const onDropRejected = useCallback(
    (rejections: FileRejection[]) => {
      const firstError = rejections[0]?.errors[0];

      if (!firstError) {
        onValidationError?.("Some files could not be selected.");
        return;
      }

      if (firstError.code === "too-many-files") {
        onValidationError?.(
          `Maximum ${FILE_CONFIG.maxFilesPerShare} files per share.`,
        );
        return;
      }

      if (firstError.code === "file-too-large") {
        const maxMb = Math.round(FILE_CONFIG.maxUploadFileSize / 1024 / 1024);
        onValidationError?.(
          `File too large. Maximum allowed upload size is ${maxMb}MB.`,
        );
        return;
      }

      onValidationError?.(
        firstError.message || "Some files could not be selected.",
      );
    },
    [onValidationError],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDropRejected,
    accept: {
      ...imageAcceptConfig,
      ...videoAcceptConfig,
    },
    maxSize: FILE_CONFIG.maxUploadFileSize,
    maxFiles: FILE_CONFIG.maxFilesPerShare,
    disabled,
  });

  const removeFile = (index: number) => {
    const fileToRemove = selectedFiles[index];
    if (fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }

    updateSelectedFiles((previous) => previous.filter((_, i) => i !== index));
  };

  useEffect(() => {
    return () => {
      selectedFiles.forEach((file) => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, [selectedFiles]);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
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
            ? "var(--color-interactive)"
            : "var(--color-border)",
          backgroundColor: isDragActive
            ? "rgba(0, 113, 227, 0.05)"
            : "var(--color-bg-secondary)",
          transform: isDragActive ? "scale(1.01)" : "scale(1)",
          opacity: disabled ? 0.5 : 1,
          pointerEvents: disabled ? "none" : "auto",
        }}
      >
        <input {...getInputProps()} />

        <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-200"
            style={{
              backgroundColor: "var(--color-bg-primary)",
              transform: isDragActive ? "scale(1.1)" : "scale(1)",
            }}
          >
            <FiUploadCloud
              className="h-7 w-7"
              style={{ color: "var(--color-interactive)" }}
            />
          </div>

          <div>
            <p
              className="text-base font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              {isDragActive ? "Drop files here" : "Drag & drop files here"}
            </p>
            {!isDragActive && (
              <p
                className="text-sm mt-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                or click to select files
              </p>
            )}
          </div>

          <p
            className="text-xs"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Max {FILE_CONFIG.maxFilesPerShare} files. Images up to{" "}
            {Math.round(FILE_CONFIG.maxImageFileSize / 1024 / 1024)}MB, videos
            up to {Math.round(FILE_CONFIG.maxVideoFileSize / 1024 / 1024)}MB
            each.
          </p>
        </div>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="space-y-3">
          <p
            className="text-sm font-medium flex items-center gap-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            <FiImage
              className="h-4 w-4"
              style={{ color: "var(--color-interactive)" }}
            />
            Selected files ({selectedFiles.length})
          </p>

          <div className="space-y-2">
            {selectedFiles.map((file, index) => {
              const mediaKind = getMediaKindFromMimeType(file.type);

              return (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center justify-between p-3 rounded-lg transition-colors duration-150"
                  style={{
                    backgroundColor: "var(--color-bg-secondary)",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {mediaKind === "image" && file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-10 h-10 object-cover rounded-lg"
                        style={{ border: "1px solid var(--color-border)" }}
                      />
                    ) : (
                      <div
                        className="w-10 h-10 flex items-center justify-center rounded-lg"
                        style={{ backgroundColor: "var(--color-bg-primary)" }}
                      >
                        {mediaKind === "video" ? (
                          <FiVideo
                            className="w-5 h-5"
                            style={{ color: "var(--color-interactive)" }}
                          />
                        ) : (
                          <FiFile
                            className="w-5 h-5"
                            style={{ color: "var(--color-interactive)" }}
                          />
                        )}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm font-medium truncate"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {file.name}
                      </p>
                      <p
                        className="text-xs"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{
                        backgroundColor: "var(--color-bg-primary)",
                        color: "var(--color-text-secondary)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      {mediaKind === "video" ? "Video" : "Image"}
                    </span>
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
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
