/**
 * Application constants and configuration
 */

export const APP_CONFIG = {
  name: 'PureShare',
  description: 'Temporary file sharing with ephemeral storage',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

export const FILE_CONFIG = {
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '104857600'), // 100MB
  maxFilesPerShare: parseInt(process.env.MAX_FILES_PER_SHARE || '50'),
  allowedTypes: (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/gif,image/webp').split(','),
} as const;

export const SHARE_CONFIG = {
  defaultExpirationHours: parseInt(process.env.DEFAULT_EXPIRATION_HOURS || '48'),
  maxExpirationDays: parseInt(process.env.MAX_EXPIRATION_DAYS || '30'),
  minExpirationHours: 1,
} as const;

export const SECURITY_CONFIG = {
  passwordHashRounds: parseInt(process.env.PASSWORD_HASH_ROUNDS || '10'),
  shareLinkLength: 12,
} as const;

export const AWS_CONFIG = {
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  bucketName: process.env.AWS_S3_BUCKET_NAME || '',
} as const;

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
} as const;
