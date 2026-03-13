/**
 * API Route: GET /api/share/[id]/download-all
 * Streams all files in a share as a ZIP archive
 * Enforces password protection via cookie verification
 */

import { NextRequest } from 'next/server';
import { Readable } from 'node:stream';
import { supabaseAdmin } from '@/lib/db/supabase';
import {
  applyRateLimit,
  getRateLimitIdentifier,
  rateLimiters,
} from '@/lib/middleware/rate-limit';
import { s3Client } from '@/lib/storage/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { isValidShareLink } from '@/lib/security/share-link';
import {
  badRequestResponse,
  notFoundResponse,
  goneResponse,
  unauthorizedResponse,
  serverErrorResponse,
} from '@/lib/utils/api-response';
import archiver from 'archiver';
import { getEnvConfig } from '@/lib/utils/env-validation';

const env = getEnvConfig();

function getShareAccessCookieName(shareLink: string): string {
  return `share_access_${shareLink}`;
}

function isShareAccessVerified(request: NextRequest, shareLink: string): boolean {
  const cookieName = getShareAccessCookieName(shareLink);
  const cookie = request.cookies.get(cookieName);
  return cookie?.value === 'verified';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shareLink } = await params;

    const rateLimitResponse = await applyRateLimit(
      rateLimiters.download,
      `${getRateLimitIdentifier(request)}:share:${shareLink}:zip`,
    );

    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    // Validate share link format
    if (!isValidShareLink(shareLink)) {
      return badRequestResponse('Invalid share link format');
    }

    // Get share from database
    const { data: share, error: shareError } = await supabaseAdmin
      .from('shares')
      .select('id, expires_at, password_hash')
      .eq('share_link', shareLink)
      .single();

    if (shareError || !share) {
      return notFoundResponse('Share not found');
    }

    // Check if expired
    if (new Date(share.expires_at) < new Date()) {
      return goneResponse('Share has expired');
    }

    // Check password protection if required
    const requiresPassword = !!share.password_hash;
    if (requiresPassword) {
      if (!isShareAccessVerified(request, shareLink)) {
        return unauthorizedResponse('Password required');
      }
    }

    // Get all files for this share
    const { data: files, error: filesError } = await supabaseAdmin
      .from('files')
      .select('id, filename, s3_key')
      .eq('share_id', share.id)
      .eq('upload_status', 'completed')
      .order('uploaded_at', { ascending: true });

    if (filesError || !files || files.length === 0) {
      return notFoundResponse('No files found in this share');
    }

    const shouldValidateOnly = request.nextUrl.searchParams.get('validate') === '1';

    if (shouldValidateOnly) {
      for (const file of files) {
        try {
          await s3Client.send(
            new GetObjectCommand({
              Bucket: env.AWS_S3_BUCKET_NAME,
              Key: file.s3_key,
              Range: 'bytes=0-0',
            }),
          );
        } catch (error) {
          console.error(`ZIP validation failed for ${file.filename}:`, error);
          return serverErrorResponse(`Unable to prepare ZIP: missing file ${file.filename}`);
        }
      }

      return new Response(null, { status: 204 });
    }

    // Create a ReadableStream for the ZIP
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Start archiving in the background
    (async () => {
      try {
        const archive = archiver('zip', {
          zlib: { level: 9 }, // Maximum compression
        });

        // Handle archive errors
        archive.on('error', (err) => {
          console.error('Archive error:', err);
          writer.abort(err);
        });

        // Pipe archive to the writable stream
        archive.on('data', (chunk) => {
          writer.write(chunk);
        });

        archive.on('end', () => {
          writer.close();
        });

        // Add each file to the archive
        for (const file of files) {
          const command = new GetObjectCommand({
            Bucket: env.AWS_S3_BUCKET_NAME,
            Key: file.s3_key,
          });

          const response = await s3Client.send(command);
          if (!response.Body) {
            throw new Error(`Missing body stream for ${file.filename}`);
          }

          archive.append(response.Body as Readable, { name: file.filename });
        }

        // Finalize the archive
        await archive.finalize();
      } catch (error) {
        console.error('Error creating ZIP:', error);
        writer.abort(error);
      }
    })();

    // Return streaming response
    return new Response(readable, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="pureshare-${shareLink}.zip"`,
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Unexpected error in download-all:', error);
    return serverErrorResponse('Failed to create ZIP archive');
  }
}
