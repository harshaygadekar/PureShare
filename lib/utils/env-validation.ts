/**
 * Environment Variable Validation
 * Validates all required environment variables at startup
 */

import { z } from "zod";

/**
 * Environment schema validation
 */
const envSchema = z.object({
  // Node environment
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // App configuration
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // AWS Configuration
  AWS_REGION: z.string().min(1, "AWS_REGION is required"),
  AWS_ACCESS_KEY_ID: z.string().min(1, "AWS_ACCESS_KEY_ID is required"),
  AWS_SECRET_ACCESS_KEY: z.string().min(1, "AWS_SECRET_ACCESS_KEY is required"),
  AWS_S3_BUCKET_NAME: z.string().min(1, "AWS_S3_BUCKET_NAME is required"),

  // Supabase Configuration
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required"),
  SUPABASE_SERVICE_ROLE_KEY: z
    .string()
    .min(1, "SUPABASE_SERVICE_ROLE_KEY is required"),

  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),

  // Upstash Redis (for rate limiting)
  UPSTASH_REDIS_REST_URL: z
    .string()
    .url("UPSTASH_REDIS_REST_URL must be a valid URL")
    .optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // Email Configuration (Resend)
  RESEND_API_KEY: z.string().optional(),
  FROM_EMAIL: z.string().email().optional(),

  // Security Configuration
  PASSWORD_HASH_ROUNDS: z
    .string()
    .default("10")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(10).max(15)),

  // File Upload Configuration
  MAX_FILE_SIZE: z
    .string()
    .default("104857600")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  MAX_IMAGE_FILE_SIZE: z
    .string()
    .default("104857600")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  MAX_VIDEO_FILE_SIZE: z
    .string()
    .default("524288000")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  MAX_FILES_PER_SHARE: z
    .string()
    .default("50")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  ALLOWED_FILE_TYPES: z
    .string()
    .default("image/jpeg,image/png,image/gif,image/webp"),
  ALLOWED_IMAGE_FILE_TYPES: z
    .string()
    .default("image/jpeg,image/png,image/gif,image/webp"),
  ALLOWED_VIDEO_FILE_TYPES: z
    .string()
    .default("video/mp4,video/webm,video/quicktime"),

  // Share Configuration
  DEFAULT_EXPIRATION_HOURS: z
    .string()
    .default("48")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  DEFAULT_VIDEO_EXPIRATION_HOURS: z
    .string()
    .default("24")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  STANDARD_EXPIRATION_OPTIONS_HOURS: z.string().default("24,48,72,168"),
  VIDEO_EXPIRATION_OPTIONS_HOURS: z.string().default("24,48,72,168"),

  MAX_EXPIRATION_DAYS: z
    .string()
    .default("30")
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().positive()),

  // CORS Configuration
  ALLOWED_ORIGINS: z.string().optional(),

  // Monitoring (optional)
  SENTRY_DSN: z.string().url().optional().or(z.literal("")),
  POSTHOG_KEY: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate environment variables
 * Call this at app startup
 */
export function validateEnv(): Env {
  try {
    const env = envSchema.parse(process.env);
    return env;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.issues.map((err) => {
        const path = err.path.join(".");
        return `  - ${path}: ${err.message}`;
      });

      console.error("❌ Environment variable validation failed:\n");
      console.error(missing.join("\n"));
      console.error(
        "\nPlease check your .env.local file and ensure all required variables are set.",
      );

      throw new Error("Environment validation failed");
    }
    throw error;
  }
}

/**
 * Check if required environment variables are present
 */
export function checkRequiredEnvVars(): {
  valid: boolean;
  missing: string[];
  warnings: string[];
} {
  const missing: string[] = [];
  const warnings: string[] = [];

  // Critical env vars
  const critical = [
    "AWS_REGION",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_S3_BUCKET_NAME",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
  ];

  critical.forEach((key) => {
    if (!process.env[key]) {
      missing.push(key);
    }
  });

  // Optional but recommended
  const recommended = [
    "UPSTASH_REDIS_REST_URL",
    "UPSTASH_REDIS_REST_TOKEN",
    "RESEND_API_KEY",
  ];

  recommended.forEach((key) => {
    if (!process.env[key]) {
      warnings.push(key);
    }
  });

  return {
    valid: missing.length === 0,
    missing,
    warnings,
  };
}

/**
 * @deprecated JWT authentication has been replaced with Clerk
 * This function is kept for backward compatibility but should not be used
 */
export function ensureJwtSecret(): string {
  throw new Error(
    "JWT authentication has been replaced with Clerk. Please use Clerk authentication instead.",
  );
}

/**
 * Get validated environment config
 */
export function getEnvConfig(): Env {
  return validateEnv();
}

/**
 * Check if feature flags are enabled
 */
export const featureFlags = {
  isRateLimitingEnabled: (): boolean => {
    return !!(
      process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    );
  },

  isEmailEnabled: (): boolean => {
    return !!(process.env.RESEND_API_KEY && process.env.FROM_EMAIL);
  },

  isMonitoringEnabled: (): boolean => {
    return !!(process.env.SENTRY_DSN || process.env.POSTHOG_KEY);
  },

  isProduction: (): boolean => {
    return process.env.NODE_ENV === "production";
  },

  isDevelopment: (): boolean => {
    return process.env.NODE_ENV === "development";
  },
};

/**
 * Log environment status at startup
 */
export function logEnvStatus(): void {
  const { valid, missing, warnings } = checkRequiredEnvVars();

  console.log("\n🔧 Environment Configuration Status:\n");

  if (valid) {
    console.log("✅ All critical environment variables are set");
  } else {
    console.log("❌ Missing critical environment variables:");
    missing.forEach((key) => console.log(`   - ${key}`));
  }

  if (warnings.length > 0) {
    console.log("\n⚠️  Optional environment variables not set:");
    warnings.forEach((key) => console.log(`   - ${key}`));
  }

  console.log("\n📋 Feature Flags:");
  console.log(
    `   - Rate Limiting: ${featureFlags.isRateLimitingEnabled() ? "✅" : "❌"}`,
  );
  console.log(`   - Email: ${featureFlags.isEmailEnabled() ? "✅" : "❌"}`);
  console.log(
    `   - Monitoring: ${featureFlags.isMonitoringEnabled() ? "✅" : "❌"}`,
  );
  console.log(`   - Environment: ${process.env.NODE_ENV || "development"}\n`);
}
