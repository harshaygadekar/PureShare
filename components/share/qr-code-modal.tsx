"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from "react";
import { FiCopy, FiCheck } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateQRCodeDataUrl, getShareUrl } from "@/lib/utils/qrcode";
import { toast } from "sonner";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareLink: string;
}

export function QRCodeModal({ isOpen, onClose, shareLink }: QRCodeModalProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const [generatedFor, setGeneratedFor] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const shareUrl = getShareUrl(shareLink);

  useEffect(() => {
    if (isOpen && shareLink && generatedFor !== shareUrl) {
      generateQRCodeDataUrl(shareUrl)
        .then((url) => {
          setQrCodeUrl(url);
          setGeneratedFor(shareUrl);
        })
        .catch(console.error)
    }
  }, [generatedFor, isOpen, shareLink, shareUrl]);

  const isGenerating = isOpen && !!shareLink && generatedFor !== shareUrl;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share via QR Code</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4">
          {isGenerating ? (
            <div className="w-64 h-64 flex items-center justify-center bg-gray-100 rounded-lg">
              <div className="animate-pulse text-gray-400">Generating QR code...</div>
            </div>
          ) : qrCodeUrl && generatedFor === shareUrl ? (
            <div className="p-4 bg-white rounded-lg border">
              <img
                src={qrCodeUrl}
                alt="QR Code for share link"
                className="w-56 h-56"
              />
            </div>
          ) : null}

          <div className="w-full space-y-2">
            <p className="text-sm text-gray-500 text-center">
              Scan this QR code to open the share link
            </p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 px-3 py-2 text-sm border rounded-lg bg-gray-50"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                title="Copy link"
              >
                {copied ? <FiCheck className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
