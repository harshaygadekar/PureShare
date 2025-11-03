/**
 * API Route: POST /api/upload/create
 * Creates a new share and returns the share link
 */

import { NextRequest } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';
import { generateShareLink } from '@/lib/auth/share-link';
import { hashPassword } from '@/lib/auth/password';
import { createShareSchema } from '@/lib/validations/share';
import { successResponse, badRequestResponse, serverErrorResponse } from '@/lib/utils/api-response';
import type { CreateShareResponse } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const validation = createShareSchema.safeParse(body);
    if (!validation.success) {
      return badRequestResponse(validation.error.errors[0].message);
    }

    const { password, expirationHours } = validation.data;

    // Generate unique share link
    let shareLink: string;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      shareLink = generateShareLink();

      // Check if share link already exists
      const { data: existing } = await supabaseAdmin
        .from('shares')
        .select('id')
        .eq('share_link', shareLink)
        .single();

      if (!existing) break;
      attempts++;
    }

    if (attempts === maxAttempts) {
      return serverErrorResponse('Failed to generate unique share link');
    }

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expirationHours!);

    // Hash password if provided
    const passwordHash = password ? await hashPassword(password) : null;

    // Insert share into database
    const { data: share, error } = await supabaseAdmin
      .from('shares')
      .insert({
        share_link: shareLink!,
        password_hash: passwordHash,
        expires_at: expiresAt.toISOString(),
        file_count: 0,
      })
      .select('id, share_link, expires_at')
      .single();

    if (error) {
      console.error('Error creating share:', error);
      return serverErrorResponse('Failed to create share');
    }

    const response: CreateShareResponse = {
      shareLink: share.share_link,
      expiresAt: share.expires_at,
      shareId: share.id,
    };

    return successResponse(response, 201);
  } catch (error) {
    console.error('Unexpected error in create share:', error);
    return serverErrorResponse('An unexpected error occurred');
  }
}
