/**
 * Health Check API Route
 * GET /api/health
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { s3Client } from '@/lib/storage/s3';
import { ListBucketsCommand } from '@aws-sdk/client-s3';
import { featureFlags } from '@/lib/utils/env-validation';

/**
 * GET /api/health
 * Check application health and service status
 */
export async function GET(request: NextRequest) {
  const checks: Record<string, { status: 'healthy' | 'unhealthy'; message?: string }> = {};

  // Check Supabase connection
  try {
    const { error } = await supabaseAdmin.from('shares').select('id').limit(1);
    checks.database = error
      ? { status: 'unhealthy', message: error.message }
      : { status: 'healthy' };
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // Check S3 connection
  try {
    await s3Client.send(new ListBucketsCommand({}));
    checks.storage = { status: 'healthy' };
  } catch (error) {
    checks.storage = {
      status: 'unhealthy',
      message: error instanceof Error ? error.message : 'Unknown error',
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
      environment: process.env.NODE_ENV || 'development',
      checks,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
