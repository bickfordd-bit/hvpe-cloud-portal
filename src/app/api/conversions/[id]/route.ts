import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSuccessResponse, createErrorResponse, ErrorCodes } from "@/lib/apiResponse";

/**
 * PATCH /api/conversions/[id]
 * Update a conversion event
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => null);

    if (!body) {
      return createErrorResponse("Request body is required", 400, ErrorCodes.INVALID_INPUT);
    }

    // Fetch existing conversion from AiUsageLog workaround storage
    const logs = await prisma.aiUsageLog.findMany({
      where: {
        mode: "conversion",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let existingConversion = null;
    let existingLog = null;

    for (const log of logs) {
      try {
        const conversion = JSON.parse(log.errorMessage || "{}");
        if (conversion.id === id) {
          existingConversion = conversion;
          existingLog = log;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!existingConversion || !existingLog) {
      return createErrorResponse("Conversion not found", 404, ErrorCodes.NOT_FOUND);
    }

    // Update the conversion with provided fields
    const updatedConversion = {
      ...existingConversion,
      ...body,
      id: existingConversion.id, // Preserve ID
      accountId: existingConversion.accountId, // Preserve accountId
      timestamp: existingConversion.timestamp, // Preserve original timestamp
      createdAt: existingConversion.createdAt, // Preserve createdAt
      updatedAt: new Date().toISOString(),
    };

    // Store updated version
    await prisma.aiUsageLog.create({
      data: {
        tenantId: existingConversion.accountId,
        userId: existingConversion.accountId,
        mode: "conversion",
        taskType: "update",
        success: true,
        errorMessage: JSON.stringify(updatedConversion),
      },
    });

    return createSuccessResponse(updatedConversion);
  } catch (error: any) {
    return createErrorResponse(error, 500, ErrorCodes.INTERNAL_ERROR);
  }
}

/**
 * DELETE /api/conversions/[id]
 * Delete a conversion event
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Fetch existing conversion from AiUsageLog workaround storage
    const logs = await prisma.aiUsageLog.findMany({
      where: {
        mode: "conversion",
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    let existingConversion = null;

    for (const log of logs) {
      try {
        const conversion = JSON.parse(log.errorMessage || "{}");
        if (conversion.id === id) {
          existingConversion = conversion;
          break;
        }
      } catch {
        continue;
      }
    }

    if (!existingConversion) {
      return createErrorResponse("Conversion not found", 404, ErrorCodes.NOT_FOUND);
    }

    // Mark as deleted by creating a tombstone record
    const deletedConversion = {
      ...existingConversion,
      deleted: true,
      deletedAt: new Date().toISOString(),
    };

    await prisma.aiUsageLog.create({
      data: {
        tenantId: existingConversion.accountId,
        userId: existingConversion.accountId,
        mode: "conversion",
        taskType: "delete",
        success: true,
        errorMessage: JSON.stringify(deletedConversion),
      },
    });

    return createSuccessResponse({ deleted: true, id });
  } catch (error: any) {
    return createErrorResponse(error, 500, ErrorCodes.INTERNAL_ERROR);
  }
}
