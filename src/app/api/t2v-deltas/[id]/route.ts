import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSuccessResponse, createErrorResponse, ErrorCodes } from "@/lib/apiResponse";

/**
 * PATCH /api/t2v-deltas/[id]
 * Update improved value and timestamp (improvedCapturedAt = now)
 * Optional: notes, confidence
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => null);

    if (!body) {
      return createErrorResponse("Request body is required", 400, ErrorCodes.INVALID_INPUT);
    }

    const { improvedValue, notes, confidence } = body;

    if (typeof improvedValue !== "number") {
      return createErrorResponse(
        "improvedValue is required and must be a number",
        400,
        ErrorCodes.MISSING_REQUIRED_FIELD
      );
    }

    // Fetch existing delta from AiUsageLog workaround storage
    const logs = await prisma.aiUsageLog.findMany({
      where: {
        mode: "t2v-delta",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let existingDelta = null;
    let existingLog = null;

    for (const log of logs) {
      try {
        const delta = JSON.parse(log.errorMessage || "{}");
        if (delta.id === id) {
          existingDelta = delta;
          existingLog = log;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!existingDelta || !existingLog) {
      return createErrorResponse("T2V delta not found", 404, ErrorCodes.NOT_FOUND);
    }

    // Update the delta
    const updatedDelta = {
      ...existingDelta,
      improvedValue,
      improvedCapturedAt: new Date().toISOString(),
      notes: notes !== undefined ? notes : existingDelta.notes,
      confidence: confidence !== undefined ? confidence : existingDelta.confidence,
      updatedAt: new Date().toISOString(),
    };

    // Update in storage (create new record since we can't update the existing one properly)
    await prisma.aiUsageLog.create({
      data: {
        tenantId: existingDelta.accountId,
        userId: existingDelta.accountId,
        mode: "t2v-delta",
        taskType: "update",
        success: true,
        errorMessage: JSON.stringify(updatedDelta),
      },
    });

    return createSuccessResponse(updatedDelta);
  } catch (error: any) {
    return createErrorResponse(error, 500, ErrorCodes.INTERNAL_ERROR);
  }
}
