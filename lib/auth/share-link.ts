/**
 * Share link generation utilities
 */

import { randomBytes } from 'crypto';
import { SECURITY_CONFIG } from '@/config/constants';

/**
 * Generate a random share link
 * Uses crypto.randomBytes for secure random generation
 */
export function generateShareLink(): string {
  const length = SECURITY_CONFIG.shareLinkLength;
  const bytes = randomBytes(Math.ceil(length * 0.75));
  return bytes
    .toString('base64')
    .replace(/\+/g, '')
    .replace(/\//g, '')
    .replace(/=/g, '')
    .substring(0, length);
}

/**
 * Validate share link format
 */
export function isValidShareLink(link: string): boolean {
  const regex = new RegExp(`^[A-Za-z0-9]{${SECURITY_CONFIG.shareLinkLength}}$`);
  return regex.test(link);
}
