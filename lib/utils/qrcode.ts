import QRCode from 'qrcode';
import { APP_CONFIG } from '@/config/constants';

export async function generateQRCodeDataUrl(data: string): Promise<string> {
  try {
    return await QRCode.toDataURL(data, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export function getShareUrl(shareLink: string): string {
  // Use dynamic origin on client, fallback to env config on server
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/share/${shareLink}`;
  }
  return `${APP_CONFIG.url}/share/${shareLink}`;
}
