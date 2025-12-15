import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse, ErrorCodes } from "@/lib/apiResponse";
import { t2vStore } from "@/lib/t2v/store";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await req.json().catch(() => null);

    if (!body || typeof body.improvedValue !== "number") {
      return createErrorResponse(
        "Missing required field: improvedValue",
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    // Find the delta in the store
    const delta = t2vStore.find((d) => d.id === id);

    if (!delta) {
      return createErrorResponse(
        `T2V Delta not found: ${id}`,
        404,
        ErrorCodes.NOT_FOUND
      );
    }

    // Update the delta
    delta.improvedValue = body.improvedValue;
    delta.improvedCapturedAt = new Date().toISOString();
    delta.updatedAt = new Date().toISOString();

    return createSuccessResponse(delta);
  } catch (error) {
    return createErrorResponse(error as Error, 500);
  }
}
