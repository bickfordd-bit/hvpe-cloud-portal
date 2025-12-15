import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSuccessResponse, createErrorResponse, ErrorCodes } from "@/lib/apiResponse";

/**
 * POST /api/conversions
 * Create a new conversion event
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (!body) {
      return createErrorResponse("Request body is required", 400, ErrorCodes.INVALID_INPUT);
    }

    const { accountId, eventType, eventData, metadata } = body;

    if (!accountId || !eventType) {
      return createErrorResponse(
        "accountId and eventType are required",
        400,
        ErrorCodes.MISSING_REQUIRED_FIELD
      );
    }

    const conversion = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      accountId,
      eventType,
      eventData: eventData || {},
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store in AiUsageLog as a workaround
    await prisma.aiUsageLog.create({
      data: {
        tenantId: accountId,
        userId: accountId,
        mode: "conversion",
        taskType: eventType,
        success: true,
        errorMessage: JSON.stringify(conversion),
      },
    });

    return createSuccessResponse(conversion, 201);
  } catch (error: any) {
    return createErrorResponse(error, 500, ErrorCodes.INTERNAL_ERROR);
  }
}

/**
 * GET /api/conversions
 * List conversions by accountId, ordered by timestamp DESC
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    if (!accountId) {
      return createErrorResponse(
        "accountId query parameter is required",
        400,
        ErrorCodes.MISSING_REQUIRED_FIELD
      );
    }

    // Fetch from AiUsageLog workaround storage
    const logs = await prisma.aiUsageLog.findMany({
      where: {
        tenantId: accountId,
        mode: "conversion",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 100,
    });

    const conversions = logs
      .map((log) => {
        try {
          return JSON.parse(log.errorMessage || "{}");
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    return createSuccessResponse(conversions);
  } catch (error: any) {
    return createErrorResponse(error, 500, ErrorCodes.INTERNAL_ERROR);
  }
}
