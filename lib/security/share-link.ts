/**
 * Share Link Generation
 * Generates unique, URL-safe share links
 */

import { nanoid } from 'nanoid';

/**
 * Generate a unique share link
 * Uses nanoid for cryptographically strong random IDs
 */
export function generateShareLink(length: number = 12): string {
  return nanoid(length);
}

/**
 * Validate share link format
 */
export function isValidShareLink(shareLink: string): boolean {
  // nanoid uses URL-safe characters: A-Za-z0-9_-
  const regex = /^[A-Za-z0-9_-]{8,32}$/;
  return regex.test(shareLink);
}
