/**
 * API Route: GET /api/user/requests
 * Get all file requests for the authenticated user
 */

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { resolveDatabaseUserId } from '@/lib/db/user-resolution';
import { successResponse, unauthorizedResponse } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
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

    // Get file counts for each request
    const requestsWithCounts = await Promise.all(
      (requests || []).map(async (req) => {
        const { count } = await supabaseAdmin
          .from('request_files')
          .select('*', { count: 'exact', head: true })
          .eq('request_id', req.id);

        return {
          ...req,
          uploadedFilesCount: count || 0,
        };
      })
    );

    return successResponse({ requests: requestsWithCounts });
  } catch (error) {
    console.error('Unexpected error in get user requests:', error);
    return successResponse({ requests: [] });
  }
}
