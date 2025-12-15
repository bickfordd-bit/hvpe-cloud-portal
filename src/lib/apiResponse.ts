import { NextResponse } from 'next/server';
import { logger } from './logger';

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId?: string;
    [key: string]: any;
  };
}

export class APIError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export function createSuccessResponse<T>(
  data: T,
  status: number = 200,
  metadata?: Record<string, any>
): NextResponse<APIResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
        ...metadata
      }
    },
    { status }
  );
}

export function createErrorResponse(
  error: string | Error | APIError,
  status: number = 500,
  code?: string
): NextResponse<APIResponse> {
  let errorCode = code || 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: any = undefined;
  let statusCode = status;

  if (error instanceof APIError) {
    errorCode = error.code;
    message = error.message;
    statusCode = error.status;
    details = error.details;
  } else if (error instanceof Error) {
    message = error.message;
    if (process.env.NODE_ENV === 'development') {
      details = { stack: error.stack };
    }
  } else if (typeof error === 'string') {
    message = error;
  }

  logger.error(`API Error: ${errorCode}`, error instanceof Error ? error : undefined, {
    code: errorCode,
    status: statusCode
  });

  return NextResponse.json(
    {
      success: false,
      error: {
        code: errorCode,
        message,
        details
      },
      metadata: {
        timestamp: new Date().toISOString()
      }
    },
    { status: statusCode }
  );
}

// Common error codes
export const ErrorCodes = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  
  // Resources
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  RESOURCE_CONFLICT: 'RESOURCE_CONFLICT',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  
  // External Services
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR',
  OPENAI_ERROR: 'OPENAI_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  
  // General
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  NOT_IMPLEMENTED: 'NOT_IMPLEMENTED'
};

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export function apiSuccess<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function apiError(error: string | Error): ApiResponse {
  return {
    success: false,
    error: error instanceof Error ? error.message : error,
    timestamp: new Date().toISOString(),
  };
}
