import { supabase } from '$lib/supabase';
import type { Database } from '$lib/database.types';
import { writeLedgerEntry } from '$lib/ledger';

type CodexTask = Database['public']['Tables']['codex_tasks']['Row'];
type CodexTaskUpdate = Database['public']['Tables']['codex_tasks']['Update'];

interface SyncResult {
  success: boolean;
  synced: number;
  failed: number;
  errors: Array<{ taskId: string; error: string }>;
}

/**
 * Synchronizes codex tasks with external systems
 */
export async function syncCodexTasks(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
  };

  try {
    // Fetch pending tasks
    const { data: tasks, error: fetchError } = await supabase
      .from('codex_tasks')
      .select('*')
      .eq('sync_status', 'pending')
      .order('created_at', { ascending: true })
      .limit(100);

    if (fetchError) {
      throw new Error(`Failed to fetch tasks: ${fetchError.message}`);
    }

    if (!tasks || tasks.length === 0) {
      return result;
    }

    // Process each task
    for (const task of tasks) {
      try {
        await syncTask(task);
        result.synced++;
      } catch (error) {
        result.failed++;
        result.errors.push({
          taskId: task.id,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    result.success = result.failed === 0;
  } catch (error) {
    result.success = false;
    result.errors.push({
      taskId: 'system',
      error: error instanceof Error ? error.message : String(error),
    });
  }

  return result;
}

/**
 * Syncs a single codex task
 */
async function syncTask(task: CodexTask): Promise<void> {
  const startTime = Date.now();
  const ledgerEntryId = `codex-sync-${task.id}-${startTime}`;

  try {
    // Validate task data
    if (!task.description || task.description.trim().length === 0) {
      throw new Error('Task description is required');
    }

    // Mark as syncing
    await updateTaskStatus(task.id, 'syncing');

    // Perform the actual sync operation
    // This is a placeholder - implement actual sync logic here
    await performExternalSync(task);

    // Mark as synced
    await updateTaskStatus(task.id, 'synced', {
      synced_at: new Date().toISOString(),
      sync_error: null,
    });

    // Write success to ledger
    // TODO: Fix ledger entry type mismatch
    /*
    await writeLedgerEntry({
      kind: 'codex-sync-success',
      subject: task.id,
      payload: {
        description: task.description,
        duration: Date.now() - startTime,
      },
      id: ledgerEntryId,
    });
    */
  } catch (error) {
    // Mark as failed
    const errorMessage = error instanceof Error ? error.message : String(error);
    await updateTaskStatus(task.id, 'failed', {
      sync_error: errorMessage,
    });

    // Write failure to ledger
    // TODO: Fix ledger entry type mismatch
    /*
    await writeLedgerEntry({
      kind: 'codex-sync-failure',
      subject: task.taskId,
      payload: {
        description: task.description,
        error: error.message,
        duration: Date.now() - startTime,
      },
      id: `${ledgerEntryId}-failure`,
    });
    */

    throw error;
  }
}

/**
 * Updates the sync status of a task
 */
async function updateTaskStatus(
  taskId: string,
  status: 'pending' | 'syncing' | 'synced' | 'failed',
  additionalUpdates?: Partial<CodexTaskUpdate>
): Promise<void> {
  const updates: CodexTaskUpdate = {
    sync_status: status,
    updated_at: new Date().toISOString(),
    ...additionalUpdates,
  };

  const { error } = await supabase
    .from('codex_tasks')
    .update(updates)
    .eq('id', taskId);

  if (error) {
    throw new Error(`Failed to update task status: ${error.message}`);
  }
}

/**
 * Performs the actual external sync operation
 * This is a placeholder implementation
 */
async function performExternalSync(task: CodexTask): Promise<void> {
  // Simulate async operation
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Add actual sync logic here
  // For example: calling external APIs, updating remote systems, etc.

  // Simulate random failures for testing
  if (Math.random() < 0.1) {
    throw new Error('Simulated sync failure');
  }
}

/**
 * Gets the current sync status summary
 */
export async function getSyncStatus(): Promise<{
  pending: number;
  syncing: number;
  synced: number;
  failed: number;
}> {
  const { data, error } = await supabase
    .from('codex_tasks')
    .select('sync_status');

  if (error) {
    throw new Error(`Failed to get sync status: ${error.message}`);
  }

  const status = {
    pending: 0,
    syncing: 0,
    synced: 0,
    failed: 0,
  };

  data?.forEach((task) => {
    if (task.sync_status in status) {
      status[task.sync_status as keyof typeof status]++;
    }
  });

  return status;
}
