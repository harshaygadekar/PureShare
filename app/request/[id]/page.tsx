"use client";

/**
 * Public File Request Upload Page
 * Where people can upload files to a request
 */

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FiUpload, FiCheck, FiClock, FiFile, FiAlertCircle, FiMail } from "react-icons/fi";
import { toast } from "sonner";

interface RequestDetails {
  id: string;
  title: string;
  description: string;
  expiresAt: string;
  maxFileSize: number;
  maxFiles: number;
  requireEmail: boolean;
  uploadedFilesCount: number;
  allowMultipleUploaders: boolean;
}

export default function RequestUploadPage() {
  const params = useParams();
  const requestId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [requestDetails, setRequestDetails] = useState<RequestDetails | null>(null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [email, setEmail] = useState("");
  const [uploadComplete, setUploadComplete] = useState(false);

  const loadRequestDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/request/${requestId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Request not found");
        return;
      }

      // API returns data directly, not wrapped in data.data
      setRequestDetails(data);
      setIsLoading(false);
    } catch (err) {
      console.error("Error loading request:", err);
      setError("Failed to load request details");
      setIsLoading(false);
    }
  }, [requestId]);

  useEffect(() => {
    loadRequestDetails();
  }, [loadRequestDetails]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (!requestDetails) return;

    // Check file count limit
    if (requestDetails.uploadedFilesCount >= requestDetails.maxFiles) {
      toast.error("Maximum number of files reached for this request");
      return;
    }

    const file = files[0];

    if (requestDetails.requireEmail && !email.trim()) {
      toast.error("Please enter your email before uploading");
      return;
    }

    // Check file size
    if (file.size > requestDetails.maxFileSize) {
      toast.error(
        `File too large. Maximum size is ${requestDetails.maxFileSize / 1024 / 1024}MB`
      );
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const uploadResponse = await fetch(`/api/request/${requestId}/upload`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          size: file.size,
          mimeType: file.type,
          email: requestDetails.requireEmail ? email.trim() : undefined,
        }),
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.message || "Failed to get upload URL");
      }

      const { uploadUrl, fileId } = await uploadResponse.json();

      // Step 2: Upload to S3
      const s3Response = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!s3Response.ok) {
        await fetch(`/api/request/${requestId}/upload`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileId, status: "failed" }),
        }).catch(() => undefined);
        throw new Error("Failed to upload file");
      }

      const finalizeResponse = await fetch(`/api/request/${requestId}/upload`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, status: "completed" }),
      });

      if (!finalizeResponse.ok) {
        throw new Error("Failed to finalize uploaded file");
      }

      setUploadProgress(100);
      setUploadComplete(true);
      toast.success("File uploaded successfully!");
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to upload file"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const formatTimeRemaining = (expiresAt: string): string => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires.getTime() - now.getTime();

    if (diff < 0) return "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days} day${days > 1 ? "s" : ""}`;
    }

    return `${hours}h ${minutes}m`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--color-bg-primary)" }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: "var(--color-interactive)", borderTopColor: "transparent" }}
          />
          <p style={{ color: "var(--color-text-secondary)" }}>Loading request...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--color-bg-primary)" }}
      >
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
          }}
        >
          <FiAlertCircle
            className="w-16 h-16 mx-auto mb-4"
            style={{ color: "var(--color-error)" }}
          />
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Request Not Available
          </h2>
          <p className="mb-6" style={{ color: "var(--color-text-secondary)" }}>
            {error}
          </p>
          <Button onClick={() => (window.location.href = "/")}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  // Upload complete state
  if (uploadComplete) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4"
        style={{ backgroundColor: "var(--color-bg-primary)" }}
      >
        <div
          className="w-full max-w-md rounded-2xl p-8 text-center"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "rgba(52, 199, 89, 0.1)" }}
          >
            <FiCheck
              className="w-8 h-8"
              style={{ color: "var(--color-success)" }}
            />
          </div>
          <h2
            className="text-2xl font-semibold mb-2"
            style={{ color: "var(--color-text-primary)" }}
          >
            Upload Successful!
          </h2>
          <p className="mb-6" style={{ color: "var(--color-text-secondary)" }}>
            Your file has been uploaded successfully.
          </p>
          <Button onClick={() => window.location.reload()}>
            Upload Another File
          </Button>
        </div>
      </div>
    );
  }

  // Main upload form
  return (
    <div
      className="min-h-screen p-4"
      style={{ backgroundColor: "var(--color-bg-primary)" }}
    >
      <div className="max-w-xl mx-auto py-12">
        <div
          className="rounded-2xl p-8"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            boxShadow: "var(--shadow-medium)",
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: "rgba(0, 113, 227, 0.1)" }}
            >
              <FiUpload
                className="w-8 h-8"
                style={{ color: "var(--color-interactive)" }}
              />
            </div>
            <h1
              className="text-2xl font-semibold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {requestDetails?.title || "File Request"}
            </h1>
            {requestDetails?.description && (
              <p
                className="mt-2 text-sm"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {requestDetails.description}
              </p>
            )}
          </div>

          {/* Request Info */}
          <div
            className="mb-6 p-4 rounded-xl"
            style={{ backgroundColor: "var(--color-bg-secondary)" }}
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <FiClock
                  className="w-4 h-4"
                  style={{ color: "var(--color-text-tertiary)" }}
                />
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Expires in {formatTimeRemaining(requestDetails?.expiresAt || "")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FiFile
                  className="w-4 h-4"
                  style={{ color: "var(--color-text-tertiary)" }}
                />
                <span style={{ color: "var(--color-text-secondary)" }}>
                  {requestDetails?.uploadedFilesCount}/{requestDetails?.maxFiles} files
                </span>
              </div>
            </div>
          </div>

          {/* Upload Form */}
          <div className="space-y-4">
            {requestDetails?.requireEmail && (
              <div className="space-y-2">
                <Label htmlFor="email">
                  <FiMail className="w-4 h-4 inline mr-1" />
                  Your Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Upload File</Label>
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors"
                style={{ borderColor: "var(--color-border)" }}
              >
                <input
                  type="file"
                  id="file"
                  onChange={handleFileSelect}
                  disabled={isUploading}
                  className="hidden"
                />
                <label htmlFor="file" className="cursor-pointer">
                  <FiUpload className="w-8 h-8 mx-auto mb-2" style={{ color: "var(--color-text-tertiary)" }} />
                  <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                    {isUploading ? "Uploading..." : "Click to select a file"}
                  </p>
                  <p className="text-xs mt-1" style={{ color: "var(--color-text-tertiary)" }}>
                    Maximum: {(requestDetails?.maxFileSize || 0) / 1024 / 1024}MB
                  </p>
                </label>
              </div>
            </div>

            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span style={{ color: "var(--color-interactive)" }}>
                    Uploading...
                  </span>
                  <span style={{ color: "var(--color-text-primary)" }}>
                    {Math.round(uploadProgress)}%
                  </span>
                </div>
                <div
                  className="h-2 overflow-hidden rounded-full"
                  style={{ backgroundColor: "var(--color-bg-secondary)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${uploadProgress}%`,
                      backgroundColor: "var(--color-interactive)",
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
