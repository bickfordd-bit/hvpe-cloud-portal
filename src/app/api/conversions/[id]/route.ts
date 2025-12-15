import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse, ErrorCodes } from "@/lib/apiResponse";
import { conversionStore } from "@/lib/conversions/store";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;
    const body = await req.json().catch(() => null);

    if (!body) {
      return createErrorResponse(
        "Request body is required",
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    // Find the conversion event in the store
    const event = conversionStore.find((e) => e.id === id);

    if (!event) {
      return createErrorResponse(
        `Conversion event not found: ${id}`,
        404,
        ErrorCodes.NOT_FOUND
      );
    }

    // Update allowed fields
    if (body.eventType !== undefined) event.eventType = body.eventType;
    if (body.value !== undefined) event.value = body.value;
    if (body.notes !== undefined) event.notes = body.notes;
    if (body.confidence !== undefined) event.confidence = body.confidence;
    if (body.metadata !== undefined) event.metadata = body.metadata;
    if (body.timestamp !== undefined) event.timestamp = body.timestamp;

    event.updatedAt = new Date().toISOString();

    return createSuccessResponse(event);
  } catch (error) {
    return createErrorResponse(error as Error, 500);
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const id = params.id;

    // Find the index of the conversion event
    const index = conversionStore.findIndex((e) => e.id === id);

    if (index === -1) {
      return createErrorResponse(
        `Conversion event not found: ${id}`,
        404,
        ErrorCodes.NOT_FOUND
      );
    }

    // Remove the event from the store
    const deleted = conversionStore.splice(index, 1)[0];

    return createSuccessResponse({ deleted: true, event: deleted });
  } catch (error) {
    return createErrorResponse(error as Error, 500);
  }
}
