import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '@/lib/apiResponse';

/**
 * GET /api/t2v-deltas
 * Filter by accountId (required) and engagementId (optional)
 * Orders by updatedAt desc, limit 500
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const engagementId = searchParams.get('engagementId');

    if (!accountId) {
      return createErrorResponse(
        'accountId query parameter is required',
        400,
        ErrorCodes.MISSING_REQUIRED_FIELD
      );
    }

    const where: any = { accountId };
    if (engagementId) {
      where.engagementId = engagementId;
    }

    const deltas = await prisma.t2VDelta.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: 500,
    });

    return createSuccessResponse(deltas);
  } catch (error) {
    console.error('Error fetching T2V deltas:', error);
    return createErrorResponse(error as Error);
  }
}

/**
 * POST /api/t2v-deltas
 * Creates a new T2V delta
 * Validates required fields, numeric baselineValue, confidence 0..1
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.accountId) {
      return createErrorResponse(
        'accountId is required',
        400,
        ErrorCodes.MISSING_REQUIRED_FIELD
      );
    }

    if (body.baselineValue === undefined || body.baselineValue === null) {
      return createErrorResponse(
        'baselineValue is required',
        400,
        ErrorCodes.MISSING_REQUIRED_FIELD
      );
    }

    // Validate baselineValue is numeric
    const baselineValue = parseFloat(body.baselineValue);
    if (isNaN(baselineValue)) {
      return createErrorResponse(
        'baselineValue must be a valid number',
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    // Validate confidence if provided
    if (body.confidence !== undefined && body.confidence !== null) {
      const confidence = parseFloat(body.confidence);
      if (isNaN(confidence) || confidence < 0 || confidence > 1) {
        return createErrorResponse(
          'confidence must be a number between 0 and 1',
          400,
          ErrorCodes.INVALID_INPUT
        );
      }
      body.confidence = confidence;
    }

    // Create delta with defaults
    const delta = await prisma.t2VDelta.create({
      data: {
        accountId: body.accountId,
        engagementId: body.engagementId || null,
        baselineValue,
        improvedValue: body.improvedValue || null,
        improvedAt: body.improvedAt ? new Date(body.improvedAt) : null,
        unit: body.unit || null,
        source: body.source || null,
        confidence: body.confidence || null,
        notes: body.notes || null,
      },
    });

    return createSuccessResponse(delta, 201);
  } catch (error) {
    console.error('Error creating T2V delta:', error);
    return createErrorResponse(error as Error);
  }
}
