/**
 * Password Hashing Utilities
 * For share link password protection (not user authentication)
 */

import bcrypt from 'bcryptjs';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const rounds = parseInt(process.env.PASSWORD_HASH_ROUNDS || '10', 10);
  return bcrypt.hash(password, rounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
