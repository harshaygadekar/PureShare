/**
 * Utility functions for API responses
 */

import { NextResponse } from 'next/server';
import type { ApiError } from '@/types/api';

export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(
  message: string,
  statusCode: number = 500,
  error: string = 'Internal Server Error'
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error,
      message,
      statusCode,
    },
    { status: statusCode }
  );
}

export function badRequestResponse(message: string) {
  return errorResponse(message, 400, 'Bad Request');
}

export function unauthorizedResponse(message: string = 'Unauthorized') {
  return errorResponse(message, 401, 'Unauthorized');
}

export function notFoundResponse(message: string = 'Not found') {
  return errorResponse(message, 404, 'Not Found');
}

export function goneResponse(message: string = 'Resource expired') {
  return errorResponse(message, 410, 'Gone');
}

export function serverErrorResponse(message: string = 'Internal server error') {
  return errorResponse(message, 500, 'Internal Server Error');
}
