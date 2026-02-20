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

    // Build date filter
    let dateFilter = {};
    if (from || to) {
      dateFilter = {
        ...(from && { created_at: { gte: from } }),
        ...(to && { created_at: { lte: to } }),
      };
    }

    // Get total views
    const { count: totalViews } = await supabaseAdmin
      .from('share_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('share_id', share.id)
      .eq('event_type', 'view')
      .then((result) => ({ count: result.count || 0 }));

    // Get unique visitors (by IP hash)
    const { data: uniqueVisitors } = await supabaseAdmin
      .from('share_analytics')
      .select('ip_hash')
      .eq('share_id', share.id)
      .neq('ip_hash', '');

    const uniqueVisitorCount = new Set(uniqueVisitors?.map((v) => v.ip_hash)).size;

    // Get total downloads
    const { count: totalDownloads } = await supabaseAdmin
      .from('share_analytics')
      .select('*', { count: 'exact', head: true })
      .eq('share_id', share.id)
      .eq('event_type', 'download_file');

    // Get downloads per file
    const { data: downloadsPerFile } = await supabaseAdmin
      .from('share_analytics')
      .select('file_id, event_type')
      .eq('share_id', share.id)
      .eq('event_type', 'download_file');

    // Aggregate downloads per file
    const fileDownloadCounts: Record<string, number> = {};
    downloadsPerFile?.forEach((d) => {
      if (d.file_id) {
        fileDownloadCounts[d.file_id] = (fileDownloadCounts[d.file_id] || 0) + 1;
      }
    });

    // Get file details for download counts
    const { data: files } = await supabaseAdmin
      .from('files')
      .select('id, filename, download_count')
      .eq('share_id', share.id);

    const filesWithDownloads = files?.map((file) => ({
      id: file.id,
      filename: file.filename,
      downloadCount: file.download_count || 0,
    })) || [];

    // Get timeline data (daily counts)
    const { data: timelineData } = await supabaseAdmin
      .from('share_analytics')
      .select('event_type, created_at')
      .eq('share_id', share.id)
      .order('created_at', { ascending: true });

    // Aggregate by date
    const timeline: Record<string, { views: number; downloads: number }> = {};
    timelineData?.forEach((event) => {
      const date = new Date(event.created_at).toISOString().split('T')[0];
      if (!timeline[date]) {
        timeline[date] = { views: 0, downloads: 0 };
      }
      if (event.event_type === 'view') {
        timeline[date].views++;
      } else if (event.event_type === 'download_file') {
        timeline[date].downloads++;
      }
    });

    return successResponse({
      share: {
        link: share.share_link,
        title: share.title,
        createdAt: share.created_at,
      },
      overview: {
        totalViews: totalViews || 0,
        uniqueVisitors: uniqueVisitorCount,
        totalDownloads: totalDownloads || 0,
      },
      files: filesWithDownloads,
      timeline: Object.entries(timeline).map(([date, data]) => ({
        date,
        ...data,
      })),
    });
  } catch (error) {
    console.error('Unexpected error in get analytics:', error);
    return badRequestResponse('An unexpected error occurred');
  }
}
