import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '@/lib/apiResponse';

/**
 * GET /api/defensibility
 * Filter by accountId (required) and stream (optional)
 * Orders by createdAt desc, limit 200
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('accountId');
    const stream = searchParams.get('stream');

    if (!accountId) {
      return createErrorResponse(
        'accountId query parameter is required',
        400,
        ErrorCodes.MISSING_REQUIRED_FIELD
      );
    }

    const where: any = { accountId };
    if (stream) {
      where.stream = stream;
    }

    const snapshots = await prisma.defensibilitySnapshot.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 200,
    });

    return createSuccessResponse(snapshots);
  } catch (error) {
    console.error('Error fetching defensibility snapshots:', error);
    return createErrorResponse(error as Error);
  }
}

/**
 * POST /api/defensibility
 * Creates a new defensibility snapshot
 * Validates levers 0..1, computes score=d+w+a+s and multiple=3+2*score
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

    // Validate and parse levers
    const levers = {
      durabilityLever: parseFloat(body.durabilityLever),
      wildcardLever: parseFloat(body.wildcardLever),
      alignmentLever: parseFloat(body.alignmentLever),
      scalabilityLever: parseFloat(body.scalabilityLever),
    };

    // Validate each lever
    for (const [name, value] of Object.entries(levers)) {
      if (isNaN(value)) {
        return createErrorResponse(
          `${name} must be a valid number`,
          400,
          ErrorCodes.INVALID_INPUT
        );
      }
      if (value < 0 || value > 1) {
        return createErrorResponse(
          `${name} must be between 0 and 1`,
          400,
          ErrorCodes.INVALID_INPUT
        );
      }
    }

    // Compute score = d + w + a + s
    const score =
      levers.durabilityLever +
      levers.wildcardLever +
      levers.alignmentLever +
      levers.scalabilityLever;

    // Compute multiple = 3 + 2 * score
    const multiple = 3 + 2 * score;

    // Create snapshot
    const snapshot = await prisma.defensibilitySnapshot.create({
      data: {
        accountId: body.accountId,
        stream: body.stream || null,
        durabilityLever: levers.durabilityLever,
        wildcardLever: levers.wildcardLever,
        alignmentLever: levers.alignmentLever,
        scalabilityLever: levers.scalabilityLever,
        score,
        multiple,
        notes: body.notes || null,
      },
    });

    return createSuccessResponse(snapshot, 201);
  } catch (error) {
    console.error('Error creating defensibility snapshot:', error);
    return createErrorResponse(error as Error);
  }
}
