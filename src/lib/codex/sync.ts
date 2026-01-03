/**
 * CODEX SYNC - TEMPORARILY DISABLED
 * 
 * This module needs refactoring to work with Next.js:
 * - Replace SvelteKit imports ($lib/*) with Next.js paths (@/lib/*)
 * - Implement missing exports: verifyCodexSecret, syncCodexChanges, previewCodexChanges
 * - Update Supabase integration for Next.js environment
 * 
 * TODO: Full refactor in separate PR
 * Related: Codex automation system for AI-driven code changes
 * 
 * Original imports (SvelteKit-style, not compatible with Next.js):
 * - import { supabase } from '$lib/supabase';
 * - import type { Database } from '$lib/database.types';
 * - import { writeLedgerEntry } from '$lib/ledger';
 */

// Temporarily export empty functions to satisfy imports
export function getSyncStatus() {
  return { 
    status: 'disabled', 
    message: 'Codex sync temporarily disabled - refactor in progress' 
  };
}

export function syncCodexTasks() {
  throw new Error('Codex sync is temporarily disabled');
}

export function verifyCodexSecret(secret: string): boolean {
  return false;
}

export async function syncCodexChanges(task: CodexTask): Promise<SyncResult> {
  throw new Error('Codex sync is temporarily disabled');
}

export async function previewCodexChanges(task: CodexTask): Promise<any> {
  throw new Error('Codex sync is temporarily disabled');
}

export type CodexTask = {
  id: string;
  taskId: string;
  description: string;
  changes: any[];
  status: 'disabled';
};

export type SyncResult = {
  success: boolean;
  error?: string;
};

/*
 * ORIGINAL CODE - Commented out until refactor
 * 
 * The code below uses SvelteKit-style imports ($lib/*) that don't work in Next.js.
 * It also references Supabase tables (codex_tasks) that may not exist yet.
 * 
 * To restore this functionality:
 * 1. Replace $lib/* imports with @/lib/* paths
 * 2. Set up Supabase client for Next.js environment
 * 3. Create or migrate codex_tasks table schema
 * 4. Implement verifyCodexSecret, syncCodexChanges, previewCodexChanges
 * 5. Test with actual Codex webhook integration
 * 
 * Original implementation below:

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

export async function syncCodexTasks(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    synced: 0,
    failed: 0,
    errors: [],
  };

  try {
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

async function syncTask(task: CodexTask): Promise<void> {
  const startTime = Date.now();
  const ledgerEntryId = `codex-sync-${task.id}-${startTime}`;

  try {
    if (!task.description || task.description.trim().length === 0) {
      throw new Error('Task description is required');
    }

    await updateTaskStatus(task.id, 'syncing');
    await performExternalSync(task);
    await updateTaskStatus(task.id, 'synced', {
      synced_at: new Date().toISOString(),
      sync_error: null,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await updateTaskStatus(task.id, 'failed', {
      sync_error: errorMessage,
    });
    throw error;
  }
}

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

async function performExternalSync(task: CodexTask): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  if (Math.random() < 0.1) {
    throw new Error('Simulated sync failure');
  }
}

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

*/
