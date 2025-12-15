import { NextRequest } from "next/server";
import { createSuccessResponse, createErrorResponse, ErrorCodes } from "@/lib/apiResponse";
import { defensibilityStore, defensibilityCounter, type DefensibilitySnapshot } from "@/lib/defensibility/store";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    
    if (!body || !body.accountId) {
      return createErrorResponse(
        "Missing required field: accountId",
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    // Validate numeric fields (0-10 range)
    const dataExclusivity = body.dataExclusivity ?? 0;
    const workflowLockIn = body.workflowLockIn ?? 0;
    const autonomousExecution = body.autonomousExecution ?? 0;
    const switchingCost = body.switchingCost ?? 0;

    if (
      typeof dataExclusivity !== "number" ||
      typeof workflowLockIn !== "number" ||
      typeof autonomousExecution !== "number" ||
      typeof switchingCost !== "number"
    ) {
      return createErrorResponse(
        "All score fields must be numbers",
        400,
        ErrorCodes.INVALID_INPUT
      );
    }

    // Calculate score and multiple according to formula
    const score = dataExclusivity + workflowLockIn + autonomousExecution + switchingCost;
    const multiple = 3 + 2 * score;

    const now = new Date().toISOString();
    const snapshot: DefensibilitySnapshot = {
      id: `def_${defensibilityCounter.value++}`,
      accountId: body.accountId,
      dataExclusivity,
      workflowLockIn,
      autonomousExecution,
      switchingCost,
      score,
      multiple,
      createdAt: now,
      metadata: body.metadata || {}
    };

    defensibilityStore.push(snapshot);

    return createSuccessResponse(snapshot, 201);
  } catch (error) {
    return createErrorResponse(error as Error, 500);
  }
}
