/**
 * API Route: GET /api/user/requests
 * Get all file requests for the authenticated user
 */

import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { resolveDatabaseUserId } from '@/lib/db/user-resolution';
import { successResponse, unauthorizedResponse } from '@/lib/utils/api-response';

interface RequestUploadCountRow {
  request_id: string;
  uploaded_files_count: number | string | null;
}

export async function GET() {
  try {
    const { userId: clerkUserId } = await auth();
    if (!clerkUserId) {
      return unauthorizedResponse('Authentication required');
    }

    const dbUserId = await resolveDatabaseUserId(clerkUserId, { allowProvision: true });
    if (!dbUserId) {
      return unauthorizedResponse('User not found');
    }

    // Get all file requests for this user
    const { data: requests, error } = await supabaseAdmin
      .from('file_requests')
      .select('*')
      .eq('user_id', dbUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching file requests:', error);
      return successResponse({ requests: [] });
    }

    const { data: uploadCounts, error: countError } = await supabaseAdmin.rpc(
      'get_user_request_upload_counts',
      { target_user_id: dbUserId },
    );

    if (countError) {
      console.error('Error fetching request upload counts:', countError);
      return successResponse({ requests: [] });
    }

    const countMap = new Map<string, number>(
      ((uploadCounts || []) as RequestUploadCountRow[]).map((row) => [
        row.request_id,
        Number(row.uploaded_files_count || 0),
      ]),
    );

    const requestsWithCounts = (requests || []).map((req) => ({
      ...req,
      uploadedFilesCount: countMap.get(req.id) || 0,
    }));

    return successResponse({ requests: requestsWithCounts });
  } catch (error) {
    console.error('Unexpected error in get user requests:', error);
    return successResponse({ requests: [] });
  }
}
