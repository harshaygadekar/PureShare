/**
 * Application constants and configuration
 */

const parseCsv = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const parseHoursCsv = (value: string, fallback: number[]): number[] => {
  const parsed = value
    .split(",")
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((hours) => Number.isFinite(hours) && hours > 0);

  if (parsed.length === 0) {
    return fallback;
  }

  return Array.from(new Set(parsed)).sort((a, b) => a - b);
};

const defaultAllowedImageTypes = "image/jpeg,image/png,image/gif,image/webp";
const defaultAllowedVideoTypes = "video/mp4,video/webm,video/quicktime";
const maxImageFileSize = Number.parseInt(
  process.env.MAX_IMAGE_FILE_SIZE || process.env.MAX_FILE_SIZE || "104857600",
  10,
);
const maxVideoFileSize = Number.parseInt(
  process.env.MAX_VIDEO_FILE_SIZE || "524288000",
  10,
); // 500MB
const allowedImageTypes = parseCsv(
  process.env.ALLOWED_IMAGE_FILE_TYPES ||
    process.env.ALLOWED_FILE_TYPES ||
    defaultAllowedImageTypes,
);
const allowedVideoTypes = parseCsv(
  process.env.ALLOWED_VIDEO_FILE_TYPES || defaultAllowedVideoTypes,
);
const standardExpirationOptionsHours = parseHoursCsv(
  process.env.STANDARD_EXPIRATION_OPTIONS_HOURS || "24,48,72,168",
  [24, 48, 72, 168],
);
const videoExpirationOptionsHours = parseHoursCsv(
  process.env.VIDEO_EXPIRATION_OPTIONS_HOURS || "24,48,72,168",
  [24, 48, 72, 168],
);

export const APP_CONFIG = {
  name: "PureShare",
  description: "Temporary file sharing with ephemeral storage",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
} as const;

export const FILE_CONFIG = {
  maxFileSize: maxImageFileSize, // Backward-compatible alias for image uploads
  maxImageFileSize,
  maxVideoFileSize,
  maxUploadFileSize: Math.max(maxImageFileSize, maxVideoFileSize),
  maxFilesPerShare: parseInt(process.env.MAX_FILES_PER_SHARE || "50"),
  allowedImageTypes,
  allowedVideoTypes,
  allowedTypes: [...allowedImageTypes, ...allowedVideoTypes],
} as const;

export const SHARE_CONFIG = {
  defaultExpirationHours: parseInt(
    process.env.DEFAULT_EXPIRATION_HOURS || "48",
  ),
  defaultVideoExpirationHours: parseInt(
    process.env.DEFAULT_VIDEO_EXPIRATION_HOURS ||
      String(videoExpirationOptionsHours[0]),
    10,
  ),
  standardExpirationOptionsHours,
  videoExpirationOptionsHours,
  maxExpirationDays: parseInt(process.env.MAX_EXPIRATION_DAYS || "30"),
  minExpirationHours: 1,
} as const;

export type MediaKind = "image" | "video" | "unknown";

export function getMediaKindFromMimeType(mimeType: string): MediaKind {
  if (FILE_CONFIG.allowedImageTypes.includes(mimeType)) return "image";
  if (FILE_CONFIG.allowedVideoTypes.includes(mimeType)) return "video";
  return "unknown";
}

export function getMaxFileSizeForMimeType(mimeType: string): number {
  const mediaKind = getMediaKindFromMimeType(mimeType);

  if (mediaKind === "video") return FILE_CONFIG.maxVideoFileSize;
  if (mediaKind === "image") return FILE_CONFIG.maxImageFileSize;

  return 0;
}

export const SECURITY_CONFIG = {
  passwordHashRounds: parseInt(process.env.PASSWORD_HASH_ROUNDS || "10"),
  shareLinkLength: 12,
} as const;

export const AWS_CONFIG = {
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  bucketName: process.env.AWS_S3_BUCKET_NAME || "",
} as const;

export const SUPABASE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
} as const;
