/**
 * Health Check API Route
 * GET /api/health
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { s3Client } from '@/lib/storage/s3';
import { HeadBucketCommand } from '@aws-sdk/client-s3';
import { featureFlags, getEnvConfig } from '@/lib/utils/env-validation';
import { unauthorizedResponse } from '@/lib/utils/api-response';

const env = getEnvConfig();

function sanitizeHealthMessage(message: string): string {
  return featureFlags.isProduction() ? 'Service check failed' : message;
}

/**
 * GET /api/health
 * Check application health and service status
 */
export async function GET(request: NextRequest) {
  if (featureFlags.isProduction()) {
    const authorization = request.headers.get('authorization');
    const bearerToken = authorization?.startsWith('Bearer ')
      ? authorization.slice('Bearer '.length)
      : null;

    if (env.HEALTH_CHECK_TOKEN) {
      if (bearerToken !== env.HEALTH_CHECK_TOKEN) {
        return unauthorizedResponse('Health check not authorized');
      }
    } else {
      const { userId } = await auth();
      if (!userId) {
        return unauthorizedResponse('Health check not authorized');
      }
    }
  }

  const checks: Record<string, { status: 'healthy' | 'unhealthy'; message?: string }> = {};

  // Check Supabase connection
  try {
    const { error } = await supabaseAdmin.from('shares').select('id').limit(1);
    checks.database = error
      ? { status: 'unhealthy', message: sanitizeHealthMessage(error.message) }
      : { status: 'healthy' };
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      message: sanitizeHealthMessage(
        error instanceof Error ? error.message : 'Unknown error',
      ),
    };
  }

  // Check S3 connection
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: env.AWS_S3_BUCKET_NAME }));
    checks.storage = { status: 'healthy' };
  } catch (error) {
    checks.storage = {
      status: 'unhealthy',
      message: sanitizeHealthMessage(
        error instanceof Error ? error.message : 'Unknown error',
      ),
    };
  }

  // Check feature flags
  checks.features = {
    status: 'healthy',
    message: JSON.stringify({
      rateLimiting: featureFlags.isRateLimitingEnabled(),
      email: featureFlags.isEmailEnabled(),
      monitoring: featureFlags.isMonitoringEnabled(),
    }),
  };

  // Overall health status
  const isHealthy = Object.values(checks).every((check) => check.status === 'healthy');

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      environment: featureFlags.isProduction() ? 'production' : 'development',
      checks,
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  );
}
