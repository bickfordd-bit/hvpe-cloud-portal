import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSuccessResponse, createErrorResponse, ErrorCodes } from '@/lib/apiResponse';

/**
 * PATCH /api/t2v-deltas/[id]
 * Updates a T2V delta
 * Supports: improvedValue (+timestamp), unit, source, confidence 0..1, notes
 * Validates numbers
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // Validate improvedValue if provided
    if (body.improvedValue !== undefined && body.improvedValue !== null) {
      const improvedValue = parseFloat(body.improvedValue);
      if (isNaN(improvedValue)) {
        return createErrorResponse(
          'improvedValue must be a valid number',
          400,
          ErrorCodes.INVALID_INPUT
        );
      }
      body.improvedValue = improvedValue;
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

    // Build update data
    const updateData: any = {};
    
    if (body.improvedValue !== undefined) {
      updateData.improvedValue = body.improvedValue;
      // Automatically set improvedAt timestamp when improvedValue is set
      updateData.improvedAt = new Date();
    }
    
    if (body.unit !== undefined) {
      updateData.unit = body.unit;
    }
    
    if (body.source !== undefined) {
      updateData.source = body.source;
    }
    
    if (body.confidence !== undefined) {
      updateData.confidence = body.confidence;
    }
    
    if (body.notes !== undefined) {
      updateData.notes = body.notes;
    }

    // Check if delta exists
    const existing = await prisma.t2VDelta.findUnique({
      where: { id },
    });

    if (!existing) {
      return createErrorResponse(
        `T2V delta with id ${id} not found`,
        404,
        ErrorCodes.NOT_FOUND
      );
    }

    // Update delta
    const updated = await prisma.t2VDelta.update({
      where: { id },
      data: updateData,
    });

    return createSuccessResponse(updated);
  } catch (error) {
    console.error('Error updating T2V delta:', error);
    return createErrorResponse(error as Error);
  }
}
