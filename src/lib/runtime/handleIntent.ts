/**
 * Intent Handler
 * Main orchestrator for intent processing with OPTR/TTV computation
 */

import { guardChain } from "./guardChain";
import { routeIntent } from "./intentRouter";
import { applyValue, initOPTR } from "./optr";
import { emitCanonEvent } from "./realtime";
import type { Intent, IntentHandlerResult, OPTRState } from "@/types/filing";
import { logger } from "@/lib/logger";
import * as fs from "fs";
import * as path from "path";

// In-memory OPTR state (per session)
const optrStates = new Map<string, OPTRState>();

/**
 * Append event to file-based ledger (.bick/ledger/)
 */
async function appendLedgerEvent(event: {
  tenant: string;
  command: string;
  event_type: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  try {
    const ledgerDir = path.join(process.cwd(), ".bick", "ledger");
    const now = new Date();
    const dateStr = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const dayDir = path.join(ledgerDir, dateStr);

    // Ensure directory exists
    if (!fs.existsSync(dayDir)) {
      fs.mkdirSync(dayDir, { recursive: true });
    }

    // Generate entry ID
    const timestamp = now.toISOString().replace(/[:.]/g, "-");
    const random = Math.random().toString(36).substring(2, 8);
    const entryId = `intent-${timestamp}-${random}`;
    const filename = `${entryId}.json`;
    const filepath = path.join(dayDir, filename);

    // Write entry
    const entry = {
      id: entryId,
      timestamp: now.toISOString(),
      tenant: event.tenant,
      command: event.command,
      event_type: event.event_type,
      payload: event.payload,
    };

    fs.writeFileSync(filepath, JSON.stringify(entry, null, 2), "utf-8");

    logger.info("Ledger event written", {
      id: entryId,
      path: filepath,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    logger.error("Failed to write ledger event", {
      error: errorMessage,
    });
  }
}

/**
 * Handle an intent through the complete pipeline
 */
export async function handleIntent(
  payload: Intent,
): Promise<IntentHandlerResult> {
  logger.info("Handling intent", {
    text: payload.text,
    sessionId: payload.sessionId,
  });

  // Route to branch
  const route = routeIntent(payload.text);

  // Authority decides
  const decision = guardChain({
    ...payload,
    route,
  });

  // OPTR: compute value delta
  if (!optrStates.has(payload.sessionId)) {
    optrStates.set(payload.sessionId, initOPTR(100)); // goal: 100 units
  }

  const optr = optrStates.get(payload.sessionId)!;
  const valueDelta = decision.status === "ALLOW" ? 1 : 0;
  const { ttv, progress } = applyValue(optr, valueDelta);

  // Persist to ledger
  await appendLedgerEvent({
    tenant: payload.instanceId,
    command: "EXECUTE",
    event_type: "INTENT",
    payload: {
      intent: payload.text,
      route: route.branchId,
      decision: decision.status,
      ttv,
      progress,
    },
  });

  // Broadcast to UI
  emitCanonEvent({
    type: "intent",
    decision: decision.status,
    route: route.branchId,
    ttv,
    progress,
    timestamp: Date.now(),
  });

  return {
    status: decision.status,
    route: route.branchId,
    ttv,
    progress,
    reasons: decision.reasons,
  };
}
