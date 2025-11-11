/**
 * Input Sanitization Utilities
 * Prevent XSS, injection attacks, and malicious input
 */

import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
  });
}

/**
 * Sanitize HTML content but allow basic formatting
 */
export function sanitizeHtmlBasic(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a'],
    ALLOWED_ATTR: ['href', 'title'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?):)?\/\//,
  });
}

/**
 * Sanitize filename to prevent path traversal and command injection
 */
export function sanitizeFilename(filename: string): string {
  // Remove any path traversal attempts
  let sanitized = filename.replace(/\.\./g, '');

  // Remove directory separators
  sanitized = sanitized.replace(/[/\\]/g, '_');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Allow only alphanumeric, dash, underscore, and dots
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_');

  // Ensure filename doesn't start with dot (hidden files)
  if (sanitized.startsWith('.')) {
    sanitized = '_' + sanitized.slice(1);
  }

  // Limit length
  if (sanitized.length > 255) {
    const ext = sanitized.slice(sanitized.lastIndexOf('.'));
    sanitized = sanitized.slice(0, 255 - ext.length) + ext;
  }

  // Ensure filename is not empty
  if (!sanitized || sanitized === '') {
    sanitized = 'unnamed_file';
  }

  return sanitized;
}

/**
 * Sanitize email address
 */
export function sanitizeEmail(email: string): string {
  // Basic email sanitization
  let sanitized = email.toLowerCase().trim();

  // Remove any HTML/JS
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  return sanitized;
}

/**
 * Sanitize URL to prevent open redirects
 */
export function sanitizeUrl(url: string, allowedDomains?: string[]): string | null {
  try {
    const parsed = new URL(url);

    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }

    // If allowedDomains provided, check domain
    if (allowedDomains && allowedDomains.length > 0) {
      const isAllowed = allowedDomains.some((domain) =>
        parsed.hostname.endsWith(domain)
      );
      if (!isAllowed) {
        return null;
      }
    }

    return parsed.toString();
  } catch {
    return null;
  }
}

/**
 * Sanitize share link (only allow alphanumeric and specific chars)
 */
export function sanitizeShareLink(link: string): string {
  return link.replace(/[^a-zA-Z0-9_-]/g, '');
}

/**
 * Sanitize username (alphanumeric, dash, underscore)
 */
export function sanitizeUsername(username: string): string {
  let sanitized = username.trim().toLowerCase();
  sanitized = sanitized.replace(/[^a-z0-9_-]/g, '');

  // Limit length
  if (sanitized.length > 50) {
    sanitized = sanitized.slice(0, 50);
  }

  return sanitized;
}

/**
 * Sanitize user input (general text)
 */
export function sanitizeInput(input: string, maxLength: number = 1000): string {
  let sanitized = input.trim();

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Remove XSS attempts
  sanitized = DOMPurify.sanitize(sanitized, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.slice(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate and sanitize JSON
 */
export function sanitizeJson<T>(input: unknown): T | null {
  try {
    // If already an object, validate it's safe
    if (typeof input === 'object' && input !== null) {
      const json = JSON.parse(JSON.stringify(input));
      return json as T;
    }

    // If string, parse it
    if (typeof input === 'string') {
      const json = JSON.parse(input);
      return json as T;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Remove common SQL injection patterns (defense in depth)
 */
export function removeSqlInjectionPatterns(input: string): string {
  const patterns = [
    /(\bOR\b|\bAND\b).*?[=<>]/gi,
    /UNION.*?SELECT/gi,
    /INSERT.*?INTO/gi,
    /UPDATE.*?SET/gi,
    /DELETE.*?FROM/gi,
    /DROP.*?TABLE/gi,
    /--/g,
    /;/g,
    /\/\*/g,
    /\*\//g,
  ];

  let sanitized = input;
  patterns.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, '');
  });

  return sanitized;
}

/**
 * Validate MIME type against allowed types
 */
export function validateMimeType(mimeType: string, allowedTypes: string[]): boolean {
  const normalizedMime = mimeType.toLowerCase().trim();

  return allowedTypes.some((allowed) => {
    // Support wildcards like "image/*"
    if (allowed.endsWith('/*')) {
      const prefix = allowed.slice(0, -2);
      return normalizedMime.startsWith(prefix);
    }
    return normalizedMime === allowed.toLowerCase();
  });
}

/**
 * Sanitize and validate file size
 */
export function validateFileSize(size: number, maxSize: number): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * Escape special regex characters
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Strip HTML tags completely
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Normalize whitespace
 */
export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim();
}

/**
 * Validate password doesn't contain common patterns
 */
export function validatePasswordNotCommon(password: string): boolean {
  const commonPasswords = [
    'password',
    '12345678',
    'qwerty',
    'abc123',
    'password123',
    'admin',
    'letmein',
    'welcome',
    'monkey',
    'dragon',
  ];

  const lowerPassword = password.toLowerCase();
  return !commonPasswords.some((common) => lowerPassword.includes(common));
}
