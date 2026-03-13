/**
 * API Route: GET /api/shares/[id]/analytics
 * Get analytics data for a share
 */

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { resolveDatabaseUserId } from '@/lib/db/user-resolution';
import { isValidShareLink } from '@/lib/security/share-link';
import {
  successResponse,
  badRequestResponse,
  notFoundResponse,
  unauthorizedResponse,
} from '@/lib/utils/api-response';

interface ShareAnalyticsOverviewRow {
  total_views: number | string | null;
  unique_visitors: number | string | null;
  total_downloads: number | string | null;
}

interface ShareFileDownloadRow {
  id: string;
  filename: string;
  download_count: number | string | null;
}

interface ShareTimelineRow {
  date: string;
  views: number | string | null;
  downloads: number | string | null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authenticate user
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return unauthorizedResponse('Authentication required');
    }

    const dbUserId = await resolveDatabaseUserId(clerkUserId);
    if (!dbUserId) {
      return unauthorizedResponse('User not found');
    }

    const { id: shareLink } = await params;
    const searchParams = request.nextUrl.searchParams;
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const fromDate = from ? new Date(from) : null;
    const toDate = to ? new Date(to) : null;

    if ((from && Number.isNaN(fromDate?.getTime())) || (to && Number.isNaN(toDate?.getTime()))) {
      return badRequestResponse('Invalid analytics date filter');
    }

    if (!isValidShareLink(shareLink)) {
      return badRequestResponse('Invalid share link format');
    }

    // Get share and verify ownership
    const { data: share, error: shareError } = await supabaseAdmin
      .from('shares')
      .select('id, share_link, user_id, title, created_at')
      .eq('share_link', shareLink)
      .single();

    if (shareError || !share) {
      return notFoundResponse('Share not found');
    }

    // Verify ownership
    if (share.user_id !== dbUserId) {
      return unauthorizedResponse('Not authorized to view this share');
    }

    const [overviewResult, filesResult, timelineResult] = await Promise.all([
      supabaseAdmin.rpc('get_share_analytics_overview', {
        target_share_id: share.id,
        from_ts: fromDate ? fromDate.toISOString() : null,
        to_ts: toDate ? toDate.toISOString() : null,
      }),
      supabaseAdmin.rpc('get_share_file_download_counts', {
        target_share_id: share.id,
        from_ts: fromDate ? fromDate.toISOString() : null,
        to_ts: toDate ? toDate.toISOString() : null,
      }),
      supabaseAdmin.rpc('get_share_analytics_timeline', {
        target_share_id: share.id,
        from_ts: fromDate ? fromDate.toISOString() : null,
        to_ts: toDate ? toDate.toISOString() : null,
      }),
    ]);

    if (overviewResult.error || filesResult.error || timelineResult.error) {
      console.error('Error fetching share analytics:', {
        overview: overviewResult.error,
        files: filesResult.error,
        timeline: timelineResult.error,
      });
      return badRequestResponse('Failed to fetch analytics');
    }

    const overview = Array.isArray(overviewResult.data)
      ? (overviewResult.data[0] as ShareAnalyticsOverviewRow | undefined)
      : (overviewResult.data as ShareAnalyticsOverviewRow | null);

    const filesWithDownloads = ((filesResult.data || []) as ShareFileDownloadRow[]).map((file) => ({
      id: file.id,
      filename: file.filename,
      downloadCount: Number(file.download_count || 0),
    }));

    const timeline = ((timelineResult.data || []) as ShareTimelineRow[]).map((row) => ({
      date: row.date,
      views: Number(row.views || 0),
      downloads: Number(row.downloads || 0),
    }));

    return successResponse({
      share: {
        link: share.share_link,
        title: share.title,
        createdAt: share.created_at,
      },
      overview: {
        totalViews: Number(overview?.total_views || 0),
        uniqueVisitors: Number(overview?.unique_visitors || 0),
        totalDownloads: Number(overview?.total_downloads || 0),
      },
      files: filesWithDownloads,
      timeline,
    });
  } catch (error) {
    console.error('Unexpected error in get analytics:', error);
    return badRequestResponse('An unexpected error occurred');
  }
}
