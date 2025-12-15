import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSuccessResponse, createErrorResponse, ErrorCodes } from "@/lib/apiResponse";

/**
 * POST /api/defensibility
 * Create defensibility snapshot with levers
 * Compute score = sum(levers) and multiple = 3 + 2 * score
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return createErrorResponse("Request body is required", 400, ErrorCodes.INVALID_INPUT);
    }

    const { accountId, levers, metadata } = body;

    if (!accountId || !Array.isArray(levers)) {
      return createErrorResponse(
        "accountId and levers (array) are required",
        400,
        ErrorCodes.MISSING_REQUIRED_FIELD
      );
    }

    // Validate levers are numbers
    if (!levers.every((lever) => typeof lever === "number")) {
      return createErrorResponse(
        "All levers must be numbers",
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    // Compute score and multiple
    const score = levers.reduce((sum, lever) => sum + lever, 0);
    const multiple = 3 + 2 * score;

    const snapshot = {
      id: `def_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accountId,
      levers,
      score,
      multiple,
      metadata: metadata || {},
      createdAt: new Date().toISOString(),
    };

    // Store in AiUsageLog as a workaround
    await prisma.aiUsageLog.create({
      data: {
        tenantId: accountId,
        userId: accountId,
        mode: "defensibility",
        taskType: "snapshot",
        success: true,
        errorMessage: JSON.stringify(snapshot),
      },
    });

    return createSuccessResponse(snapshot, 201);
  } catch (error: any) {
    return createErrorResponse(error, 500, ErrorCodes.INTERNAL_ERROR);
  }
}
