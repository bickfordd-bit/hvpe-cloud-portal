import { v4 as uuid } from "uuid";

/**
 * Wraps any async action in execution presence.
 * All external API calls should use this wrapper.
 * 
 * - Generates execution_id
 * - Ledgers start, success, and failure
 * - Returns result unchanged (transparent wrapper)
 */
export async function executeWithPresence<T>(opts: {
  tenant_id: string;
  intent: string;
  action: () => Promise<T>;
}): Promise<T> {
  const execution_id = uuid();
  const started_at = new Date().toISOString();

  // Ledger: execution started
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

    // Ledger: execution succeeded
    await appendLedgerEntry({
      execution_id,
      tenant_id: opts.tenant_id,
      type: "execution.succeeded",
      data: {
        intent: opts.intent,
        completed_at: new Date().toISOString(),
      },
    });

    return result;
  } catch (error: any) {
    // Ledger: execution failed
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
