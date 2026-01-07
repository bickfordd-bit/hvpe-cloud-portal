import { v4 as uuid } from "uuid";
import { storeArtifact } from "../artifacts/store";
import { Artifact } from "../artifacts/types";

/**
 * Enhanced execution wrapper with artifact support.
 */
export async function executeWithPresence<T>(opts: {
  tenant_id: string;
  intent: string;
  action: () => Promise<T>;
  artifacts?: Array<{
    filename: string;
    mime_type: string;
    content: Buffer;
  }>;
}): Promise<T & { execution_id: string; artifacts?: Artifact[] }> {
  const execution_id = uuid();
  const started_at = new Date().toISOString();

  await appendLedgerEntry({
    execution_id,
    tenant_id: opts.tenant_id,
    type: "execution.started",
    data: {
      intent: opts.intent,
      started_at,
    },
  });

  try {
    const result = await opts.action();

    // Store artifacts if provided
    const artifacts: Artifact[] = [];
    if (opts.artifacts) {
      for (const art of opts.artifacts) {
        const stored = await storeArtifact({
          execution_id,
          tenant_id: opts.tenant_id,
          ...art,
        });
        artifacts.push(stored);
      }
    }

    await appendLedgerEntry({
      execution_id,
      tenant_id: opts.tenant_id,
      type: "execution.succeeded",
      data: {
        intent: opts.intent,
        completed_at: new Date().toISOString(),
        artifact_count: artifacts.length,
      },
    });

    return { ...result, execution_id, artifacts: artifacts.length > 0 ? artifacts : undefined } as any;
  } catch (error: any) {
    await appendLedgerEntry({
      execution_id,
      tenant_id: opts.tenant_id,
      type: "execution.failed",
      data: {
        intent: opts.intent,
        error: error.message,
        failed_at: new Date().toISOString(),
      },
    });

    throw error;
  }
}

/**
 * Append ledger entry (stub - replace with actual ledger implementation)
 */
async function appendLedgerEntry(entry: any) {
  // TODO: Replace with actual ledger implementation when available
  // For now, log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[LEDGER]", JSON.stringify(entry, null, 2));
  }
  
  // In production, this would write to:
  // - Database ledger table
  // - Append-only log file
  // - Event stream for SSE
}
