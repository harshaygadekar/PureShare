/**
 * Validation schemas for share-related operations
 */

import { z } from 'zod';
import { SHARE_CONFIG, FILE_CONFIG } from '@/config/constants';

export const createShareSchema = z.object({
  password: z.string().min(4).max(100).optional(),
  expirationHours: z
    .number()
    .min(SHARE_CONFIG.minExpirationHours)
    .max(SHARE_CONFIG.maxExpirationDays * 24)
    .optional()
    .default(SHARE_CONFIG.defaultExpirationHours),
});

export const verifyShareSchema = z.object({
  shareLink: z.string().length(12),
  password: z.string().optional(),
});

export const uploadFileSchema = z.object({
  shareLink: z.string().length(12),
  filename: z.string().min(1).max(255),
  size: z.number().max(FILE_CONFIG.maxFileSize),
  mimeType: z.string().refine(
    (type) => FILE_CONFIG.allowedTypes.includes(type),
    { message: 'File type not allowed' }
  ),
});

export type CreateShareInput = z.infer<typeof createShareSchema>;
export type VerifyShareInput = z.infer<typeof verifyShareSchema>;
export type UploadFileInput = z.infer<typeof uploadFileSchema>;
