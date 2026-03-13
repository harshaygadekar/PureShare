/**
 * Validation schemas for share-related operations
 */

import { z } from "zod";
import {
  SHARE_CONFIG,
  FILE_CONFIG,
  getMaxFileSizeForMimeType,
} from "@/config/constants";

export const createShareSchema = z
  .object({
    password: z
      .string()
      .optional()
      .transform((val) => (val === "" ? undefined : val)) // Convert empty string to undefined
      .refine((val) => val === undefined || val.length >= 4, {
        message: "Password must be at least 4 characters",
      })
      .refine((val) => val === undefined || val.length <= 100, {
        message: "Password must be at most 100 characters",
      }),
    expirationHours: z
      .number()
      .min(SHARE_CONFIG.minExpirationHours)
      .max(SHARE_CONFIG.maxExpirationDays * 24)
      .optional(),
    expirationProfile: z
      .enum(["standard", "video"])
      .optional()
      .default("standard"),
  })
  .superRefine((data, ctx) => {
    const options =
      data.expirationProfile === "video"
        ? SHARE_CONFIG.videoExpirationOptionsHours
        : SHARE_CONFIG.standardExpirationOptionsHours;
    const configuredDefault =
      data.expirationProfile === "video"
        ? SHARE_CONFIG.defaultVideoExpirationHours
        : SHARE_CONFIG.defaultExpirationHours;
    const defaultHours = options.includes(configuredDefault)
      ? configuredDefault
      : options[0];
    const selectedHours = data.expirationHours ?? defaultHours;

    if (!options.includes(selectedHours)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["expirationHours"],
        message: `Invalid expiration option for ${data.expirationProfile} uploads`,
      });
    }
  })
  .transform((data) => {
    const options =
      data.expirationProfile === "video"
        ? SHARE_CONFIG.videoExpirationOptionsHours
        : SHARE_CONFIG.standardExpirationOptionsHours;
    const configuredDefault =
      data.expirationProfile === "video"
        ? SHARE_CONFIG.defaultVideoExpirationHours
        : SHARE_CONFIG.defaultExpirationHours;
    const defaultHours = options.includes(configuredDefault)
      ? configuredDefault
      : options[0];

    return {
      ...data,
      expirationHours: data.expirationHours ?? defaultHours,
    };
  });

export const verifyShareSchema = z.object({
  shareLink: z.string().length(12),
  password: z.string().optional(),
});

export const uploadFileSchema = z
  .object({
    shareLink: z.string().length(12),
    filename: z.string().min(1).max(255),
    size: z.number().positive(),
    mimeType: z
      .string()
      .refine((type) => FILE_CONFIG.allowedTypes.includes(type), {
        message: "File type not allowed",
      }),
  })
  .superRefine((data, ctx) => {
    const maxSize = getMaxFileSizeForMimeType(data.mimeType);

    if (!maxSize) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["mimeType"],
        message: "File type not allowed",
      });
      return;
    }

    if (data.size > maxSize) {
      const maxMb = Math.round(maxSize / 1024 / 1024);
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["size"],
        message: `File exceeds ${maxMb}MB limit for this media type`,
      });
    }
  });

export const finalizeUploadedFileSchema = z.object({
  shareLink: z.string().length(12),
  fileId: z.string().uuid(),
  status: z.enum(["completed", "failed"]),
});

export const updateShareSchema = z.object({
  extendHours: z.number().int().positive().optional(),
  password: z
    .union([z.string(), z.null()])
    .optional()
    .transform((val) => (val === "" ? null : val))
    .refine((val) => val === undefined || val === null || val.length >= 4, {
      message: "Password must be at least 4 characters",
    })
    .refine((val) => val === undefined || val === null || val.length <= 100, {
      message: "Password must be at most 100 characters",
    }),
  title: z
    .union([z.string().max(255), z.null()])
    .optional()
    .transform((val) => (typeof val === "string" ? val.trim() || null : val)),
});

export type CreateShareInput = z.infer<typeof createShareSchema>;
export type VerifyShareInput = z.infer<typeof verifyShareSchema>;
export type UploadFileInput = z.infer<typeof uploadFileSchema>;
export type FinalizeUploadedFileInput = z.infer<typeof finalizeUploadedFileSchema>;
export type UpdateShareInput = z.infer<typeof updateShareSchema>;
