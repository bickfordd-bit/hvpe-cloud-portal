import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse, ErrorCodes } from "@/lib/apiResponse";
import { conversionStore, conversionCounter, type ConversionEvent } from "@/lib/conversions/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    
    if (!body || !body.accountId || !body.eventType || typeof body.value !== "number") {
      return createErrorResponse(
        "Missing required fields: accountId, eventType, and value",
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    const now = new Date().toISOString();
    const event: ConversionEvent = {
      id: `conv_${conversionCounter.value++}`,
      accountId: body.accountId,
      eventType: body.eventType,
      value: body.value,
      notes: body.notes,
      confidence: body.confidence,
      metadata: body.metadata || {},
      timestamp: body.timestamp || now,
      createdAt: now,
      updatedAt: now
    };

    conversionStore.push(event);

    return createSuccessResponse(event, 201);
  } catch (error) {
    return createErrorResponse(error as Error, 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    let results = [...conversionStore];

    // Filter by accountId if provided
    if (accountId) {
      results = results.filter((event) => event.accountId === accountId);
    }

    // Order by timestamp descending
    results.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return createSuccessResponse(results);
  } catch (error) {
    return createErrorResponse(error as Error, 500);
  }
}
