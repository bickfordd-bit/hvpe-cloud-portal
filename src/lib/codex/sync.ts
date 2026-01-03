/**
 * Codex Sync Service
 * Automates git operations when Codex completes tasks
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { logger } from '@/lib/logger';
import { writeLedgerEntry } from '@/lib/bickford/ledger';

const execAsync = promisify(exec);

export interface CodexTask {
  taskId: string;
  description: string;
  changes: CodexChange[];
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CodexChange {
  type: 'create' | 'modify' | 'delete';
  path: string;
  content?: string;
  diff?: string;
}

export interface SyncResult {
  success: boolean;
  commitSha?: string;
  filesChanged: number;
  error?: string;
  proof: {
    commit?: string;
    pushed: boolean;
    ledgerEntryId: string;
  };
}

/**
 * Verify Codex webhook secret
 */
export function verifyCodexSecret(providedSecret: string): boolean {
  const expectedSecret = process.env.CODEX_WEBHOOK_SECRET;
  if (!expectedSecret) {
    logger.warn('CODEX_WEBHOOK_SECRET not configured');
    return false;
  }
  return providedSecret === expectedSecret;
}

/**
 * Apply Codex changes and commit
 */
export async function syncCodexChanges(task: CodexTask): Promise<SyncResult> {
  const startTime = Date.now();
  const ledgerEntryId = `codex-sync-${task.taskId}-${Date.now()}`;

  try {
    logger.info('Starting Codex sync', { taskId: task.taskId, changes: task.changes.length });

    // 1. Pull latest changes
    logger.info('Pulling latest changes');
    await execAsync('git pull --rebase origin mobile', {
      cwd: process.cwd(),
    });

    // 2. Apply changes
    const appliedFiles: string[] = [];
    for (const change of task.changes) {
      await applyChange(change);
      appliedFiles.push(change.path);
    }

    // 3. Stage changes
    logger.info('Staging changes', { files: appliedFiles });
    await execAsync(`git add ${appliedFiles.map(f => `"${f}"`).join(' ')}`, {
      cwd: process.cwd(),
    });

    // 4. Commit
    const commitMessage = `feat(codex): ${task.description}

Task ID: ${task.taskId}
Files changed: ${appliedFiles.length}
Automated via Codex sync
Timestamp: ${task.timestamp}`;

    logger.info('Creating commit');
    const { stdout: commitOutput } = await execAsync(
      `git commit -m "${commitMessage.replace(/"/g, '\\"')}"`,
      { cwd: process.cwd() }
    );

    // Extract commit SHA
    const commitSha = commitOutput.match(/\[mobile ([a-f0-9]+)\]/)?.[1];

    // 5. Push
    logger.info('Pushing to remote', { sha: commitSha });
    await execAsync('git push origin mobile', {
      cwd: process.cwd(),
    });

    // 6. Write ledger entry
    // TODO: Fix ledger entry type mismatch
    /*
    await writeLedgerEntry({
      kind: 'action',
      subject: task.taskId,
      payload: {
        description: task.description,
        filesChanged: appliedFiles.length,
        files: appliedFiles,
        commitSha,
        duration: Date.now() - startTime,
        metadata: task.metadata,
      }
    });
    */

    logger.info('Codex sync complete', {
      taskId: task.taskId,
      commitSha,
      filesChanged: appliedFiles.length,
    });

    return {
      success: true,
      commitSha,
      filesChanged: appliedFiles.length,
      proof: {
        commit: commitSha,
        pushed: true,
        ledgerEntryId,
      },
    };
  } catch (error: any) {
    logger.error('Codex sync failed', {
      taskId: task.taskId,
      error: error.message,
      stack: error.stack,
    });

    // Write failure to ledger
    // TODO: Fix type - await writeLedgerEntry({
      kind: 'codex-sync-failure',
      subject: task.taskId,
      payload: {
        description: task.description,
        error: error.message,
        duration: Date.now() - startTime,
      },
      id: `${ledgerEntryId}-failure`,
    });

    return {
      success: false,
      filesChanged: 0,
      error: error.message,
      proof: {
        pushed: false,
        ledgerEntryId: `${ledgerEntryId}-failure`,
      },
    };
  }
}

/**
 * Apply a single change
 */
async function applyChange(change: CodexChange): Promise<void> {
  const fullPath = join(process.cwd(), change.path);

  switch (change.type) {
    case 'create':
    case 'modify':
      if (!change.content) {
        throw new Error(`No content provided for ${change.type} operation on ${change.path}`);
      }
      // Ensure directory exists
      const dir = join(fullPath, '..');
      await mkdir(dir, { recursive: true });
      await writeFile(fullPath, change.content, 'utf-8');
      logger.info(`Applied ${change.type}`, { path: change.path });
      break;

    case 'delete':
      await execAsync(`rm -f "${fullPath}"`);
      logger.info('Applied delete', { path: change.path });
      break;

    default:
      throw new Error(`Unknown change type: ${(change as any).type}`);
  }
}

/**
 * Generate diff preview without applying
 */
export async function previewCodexChanges(task: CodexTask): Promise<string> {
  const lines: string[] = [];
  lines.push(`Task: ${task.description}`);
  lines.push(`Task ID: ${task.taskId}`);
  lines.push(`Changes: ${task.changes.length}`);
  lines.push('');

  for (const change of task.changes) {
    lines.push(`[${change.type.toUpperCase()}] ${change.path}`);
    if (change.diff) {
      lines.push(change.diff);
    } else if (change.content) {
      lines.push(`  Content length: ${change.content.length} bytes`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
