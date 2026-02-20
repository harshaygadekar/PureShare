"use client";

import { FiMail } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface QRCodeButtonProps {
  onClick: () => void;
}

export function QRCodeButton({ onClick }: QRCodeButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2"
    >
      <svg 
        viewBox="0 0 24 24" 
        className="w-4 h-4"
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
        <rect x="14" y="14" width="4" height="4" />
        <path d="M14 18h4v4h-4z" />
      </svg>
      QR Code
    </Button>
  );
}
