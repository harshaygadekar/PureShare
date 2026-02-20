"use client";

import { useState } from "react";
import { FiTwitter, FiLinkedin, FiMail, FiShare2, FiCheck, FiCopy } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getShareUrl } from "@/lib/utils/qrcode";
import { toast } from "sonner";

interface SocialShareProps {
  shareLink: string;
}

const platforms = [
  {
    name: "Twitter",
    icon: FiTwitter,
    getUrl: (url: string, title?: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}${title ? `&text=${encodeURIComponent(title)}` : ""}`,
  },
  {
    name: "LinkedIn",
    icon: FiLinkedin,
    getUrl: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    name: "Email",
    icon: FiMail,
    getUrl: (url: string, title?: string) =>
      `mailto:?subject=${encodeURIComponent(title || "Shared files")}&body=${encodeURIComponent(`Check out these shared files: ${url}`)}`,
  },
];

export function SocialShare({ shareLink }: SocialShareProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = getShareUrl(shareLink);

  const handleShare = (platform: (typeof platforms)[0]) => {
    const url = platform.getUrl(shareUrl, "Shared files with PureShare");
    window.open(url, "_blank", "width=600,height=400");
  };

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FiShare2 className="w-4 h-4" />
          Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {platforms.map((platform) => (
          <DropdownMenuItem
            key={platform.name}
            onClick={() => handleShare(platform)}
            className="cursor-pointer"
          >
            <platform.icon className="w-4 h-4 mr-2" />
            {platform.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
          {copied ? (
            <>
              <FiCheck className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <FiCopy className="w-4 h-4 mr-2" />
              Copy Link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
