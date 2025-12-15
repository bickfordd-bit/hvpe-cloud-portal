import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse, ErrorCodes } from "@/lib/apiResponse";
import { t2vStore, t2vCounter, type T2VDelta } from "@/lib/t2v/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    
    if (!body || !body.accountId || typeof body.baselineValue !== "number") {
      return createErrorResponse(
        "Missing required fields: accountId and baselineValue",
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    const now = new Date().toISOString();
    const newDelta: T2VDelta = {
      id: `t2v_${t2vCounter.value++}`,
      accountId: body.accountId,
      baselineValue: body.baselineValue,
      improvedValue: body.improvedValue,
      improvedCapturedAt: body.improvedValue ? now : undefined,
      createdAt: now,
      updatedAt: now,
      metadata: body.metadata || {}
    };

    t2vStore.push(newDelta);

    return createSuccessResponse(newDelta, 201);
  } catch (error) {
    return createErrorResponse(error as Error, 500);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get("accountId");

    let results = [...t2vStore];

    // Filter by accountId if provided
    if (accountId) {
      results = results.filter((delta) => delta.accountId === accountId);
    }

    // Order by updatedAt descending
    results.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    return createSuccessResponse(results);
  } catch (error) {
    return createErrorResponse(error as Error, 500);
  }
}
