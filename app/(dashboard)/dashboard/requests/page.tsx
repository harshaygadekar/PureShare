"use client";

/**
 * File Requests Dashboard Page
 * Manage file requests and view uploaded files
 */

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FiPlus, FiCopy, FiClock, FiExternalLink } from "react-icons/fi";
import { toast } from "sonner";
import { APP_CONFIG } from "@/config/constants";

interface FileRequest {
  id: string;
  share_link: string;
  title: string | null;
  description: string | null;
  expires_at: string;
  status: string;
  created_at: string;
}

export default function RequestsPage() {
  const { userId } = useAuth();
  const [title, setTitle] = useState("");
  const [expiration, setExpiration] = useState("168");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [requests, setRequests] = useState<FileRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Load requests on mount
  useEffect(() => {
    if (userId) {
      loadRequests();
    }
  }, [userId]);

  async function loadRequests() {
    try {
      const response = await fetch("/api/user/requests");
      const data = await response.json();
      if (data.requests) {
        setRequests(data.requests);
      }
    } catch (error) {
      console.error("Error loading requests:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async () => {
    if (!userId) {
      toast.error("Please log in to create a request");
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch("/api/request/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "File Request",
          description: description || null,
          expirationHours: parseInt(expiration),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create request");
      }

      toast.success("Request created!");
      setTitle("");
      setDescription("");
      
      // Add new request to list
      const newRequest: FileRequest = {
        id: data.shareLink,
        share_link: data.shareLink,
        title: title || "File Request",
        description: description || null,
        expires_at: data.expiresAt,
        status: "active",
        created_at: new Date().toISOString(),
      };
      
      setRequests([newRequest, ...requests]);
    } catch (error) {
      console.error("Error creating request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create request");
    } finally {
      setIsCreating(false);
    }
  };

  if (!userId) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
            File Requests
          </h1>
          <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
            Please log in to manage file requests
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1
          className="text-3xl font-bold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          File Requests
        </h1>
        <p className="mt-1" style={{ color: "var(--color-text-secondary)" }}>
          Create links that allow others to upload files to you
        </p>
      </div>

      {/* Create Request Form */}
      <div
        className="rounded-xl p-6"
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          border: "1px solid var(--color-border)",
        }}
      >
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Create New Request
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Request Title</Label>
              <Input
                id="title"
                placeholder="e.g., Project Files"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiration">Expires In</Label>
              <Select value={expiration} onValueChange={setExpiration}>
                <SelectTrigger id="expiration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="72">3 days</SelectItem>
                  <SelectItem value="168">7 days</SelectItem>
                  <SelectItem value="720">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              placeholder="Instructions for uploader..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate} disabled={isCreating}>
            <FiPlus className="w-4 h-4 mr-2" />
            {isCreating ? "Creating..." : "Create Request"}
          </Button>
        </div>
      </div>

      {/* Requests List */}
      <div>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-text-primary)" }}
        >
          Your Requests
        </h2>
        {loading ? (
          <div className="text-center p-8" style={{ color: "var(--color-text-secondary)" }}>
            Loading...
          </div>
        ) : requests.length === 0 ? (
          <div
            className="text-center p-8 rounded-xl"
            style={{
              backgroundColor: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p style={{ color: "var(--color-text-secondary)" }}>
              No file requests yet. Create one above!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function RequestCard({ request }: { request: FileRequest }) {
  // Use dynamic origin for shareable links
  const requestUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/request/${request.share_link}`
    : `${APP_CONFIG.url}/request/${request.share_link}`;
  const isExpired = new Date(request.expires_at) < new Date();
  const isActive = request.status === "active" && !isExpired;

  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3
            className="font-medium truncate"
            style={{ color: "var(--color-text-primary)" }}
          >
            {request.title || "Untitled Request"}
          </h3>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span
              className="flex items-center gap-1"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <FiClock className="w-4 h-4" />
              {isExpired
                ? "Expired"
                : `Expires ${new Date(request.expires_at).toLocaleDateString()}`}
            </span>
            <span
              className={`flex items-center gap-1 ${
                isActive ? "text-green-600" : "text-gray-500"
              }`}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isActive ? "#22c55e" : "#9ca3af" }}
              />
              {request.status}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(requestUrl);
                toast.success("Link copied!");
              } catch (err) {
                // Fallback for some browsers
                const textArea = document.createElement('textarea');
                textArea.value = requestUrl;
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                toast.success("Link copied!");
              }
            }}
          >
            <FiCopy className="w-4 h-4 mr-1" />
            Copy Link
          </Button>
          <Link href={`/request/${request.share_link}`}>
            <Button variant="outline" size="sm">
              <FiExternalLink className="w-4 h-4 mr-1" />
              View
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
