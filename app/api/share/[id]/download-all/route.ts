/**
 * API Route: GET /api/share/[id]/download-all
 * Streams all files in a share as a ZIP archive
 */

import { NextRequest } from 'next/server';
import { Readable } from 'stream';
import { supabaseAdmin } from '@/lib/db/supabase';
import { s3Client } from '@/lib/storage/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { isValidShareLink } from '@/lib/security/share-link';
import {
  badRequestResponse,
  notFoundResponse,
  goneResponse,
  serverErrorResponse,
} from '@/lib/utils/api-response';
import archiver from 'archiver';
import { AWS_CONFIG } from '@/config/constants';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: shareLink } = await params;

    // Validate share link format
    if (!isValidShareLink(shareLink)) {
      return badRequestResponse('Invalid share link format');
    }

    // Get share from database
    const { data: share, error: shareError } = await supabaseAdmin
      .from('shares')
      .select('id, expires_at')
      .eq('share_link', shareLink)
      .single();

    if (shareError || !share) {
      return notFoundResponse('Share not found');
    }

    // Check if expired
    if (new Date(share.expires_at) < new Date()) {
      return goneResponse('Share has expired');
    }

    // Get all files for this share
    const { data: files, error: filesError } = await supabaseAdmin
      .from('files')
      .select('id, filename, s3_key')
      .eq('share_id', share.id)
      .order('uploaded_at', { ascending: true });

    if (filesError || !files || files.length === 0) {
      return notFoundResponse('No files found in this share');
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
          try {
            // Get file from S3
            const command = new GetObjectCommand({
              Bucket: AWS_CONFIG.bucketName,
              Key: file.s3_key,
            });

            const response = await s3Client.send(command);

            if (response.Body) {
              // AWS SDK v3 Body can be converted to Buffer using transformToByteArray
              const bodyBytes = await response.Body.transformToByteArray();
              const buffer = Buffer.from(bodyBytes);
              archive.append(buffer, { name: file.filename });
            }
          } catch (error) {
            console.error(`Error adding file ${file.filename}:`, error);
            // Continue with other files instead of failing completely
          }
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
