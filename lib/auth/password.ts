/**
 * Password hashing and verification utilities
 */

import bcrypt from 'bcryptjs';
import { SECURITY_CONFIG } from '@/config/constants';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SECURITY_CONFIG.passwordHashRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
