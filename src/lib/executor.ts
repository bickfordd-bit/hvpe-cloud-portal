/**
 * Executor
 * 
 * Executes policies by generating changes and committing to GitHub.
 * Implements auto-commit flow with GitHub API integration.
 */

import { 
  PolicyBinding, 
  ExecutionPlan, 
  ExecutionResult, 
  FileChange, 
  CommitInfo,
  InvariantCheck,
  InvariantResult
} from './types';
import { loadCanon } from './canon';
import { appendLedger } from './ledger';
import { logger } from './logger';
import * as fs from 'fs';
import * as path from 'path';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'bickfordd-bit/hvpe-cloud-portal';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'mobile';

const GITHUB_API_BASE = 'https://api.github.com';

function parseRepo(full: string): { owner: string; repo: string } {
  const [owner, repo] = full.split('/');
  if (!owner || !repo) {
    throw new Error(`Invalid GITHUB_REPO format: "${full}" (expected "owner/repo")`);
  }
  return { owner, repo };
}

async function githubJson<T>(
  method: string,
  url: string,
  body?: any,
): Promise<T> {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not set');
  }

  const res = await fetch(url, {
    method,
    headers: {
      'Accept': 'application/vnd.github+json',
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: 'no-store',
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`GitHub API ${method} ${url} failed: ${res.status} ${res.statusText}${text ? ` — ${text}` : ''}`);
  }

  return (await res.json()) as T;
}

function ensureDirForFile(relativePath: string) {
  const abs = path.join(process.cwd(), relativePath);
  const dir = path.dirname(abs);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

/**
 * Check if GitHub API is configured
 */
function isGitHubConfigured(): boolean {
  return !!GITHUB_TOKEN && !!GITHUB_REPO;
}

/**
 * Generate execution plan from policy binding
 */
export function generateExecutionPlan(binding: PolicyBinding): ExecutionPlan {
  logger.info('Generating execution plan', { policyId: binding.policy.id });
  
  const changes: FileChange[] = [];

  // Always generate a safe, append-only execution artifact (committed to GitHub when configured)
  const tsSafe = binding.intent.timestamp.replace(/[:.]/g, '-');
  const rand = Math.random().toString(36).slice(2, 8);
  const artifactPath = `.bick/executions/${tsSafe}-${rand}.json`;
  const canonHash = (() => {
    try {
      return loadCanon().meta.sha256;
    } catch {
      return 'unknown';
    }
  })();
  
  changes.push({
    path: artifactPath,
    operation: 'create',
    preview: JSON.stringify({
      id: `${tsSafe}-${rand}`,
      timestamp: binding.intent.timestamp,
      intent: binding.intent.rawText,
      intentType: binding.intent.intentType,
      policyId: binding.policy.id,
      canonHash,
      reasoning: binding.reasoning,
    }, null, 2) + '\n',
  });
  
  const plan: ExecutionPlan = {
    intent: binding.intent,
    policyBinding: binding,
    changes,
    estimatedTTV: binding.policy.optrScore.ttv,
    risks: [
      {
        level: binding.policy.optrScore.risk > 0.5 ? 'high' : 'medium',
        category: 'execution',
        description: `Automated execution with ${(binding.confidence * 100).toFixed(0)}% confidence`,
        mitigation: 'Hash-chained ledger entry for rollback'
      }
    ]
  };
  
  return plan;
}

/**
 * Check invariants before execution
 */
export function checkInvariants(plan: ExecutionPlan): InvariantResult {
  logger.info('Checking invariants', { changeCount: plan.changes.length });
  
  const checks: InvariantCheck[] = [];
  
  // Check 1: Canon Compliance
  try {
    const canon = loadCanon();
    checks.push({
      name: 'Canon Integrity',
      type: 'canon_compliance',
      passed: true,
      message: `Canon verified (hash: ${canon.meta.sha256.substring(0, 16)}...)`,
      evidence: { hash: canon.meta.sha256, version: canon.meta.version }
    });
  } catch (error: any) {
    checks.push({
      name: 'Canon Integrity',
      type: 'canon_compliance',
      passed: false,
      message: `Canon verification failed: ${error.message}`,
      evidence: { error: error.message }
    });
  }
  
  // Check 2: Non-Interference
  // Verify no critical system files are being deleted
  const criticalFiles = ['package.json', 'tsconfig.json', 'next.config.ts'];
  const deletingCritical = plan.changes.some(
    change => change.operation === 'delete' && criticalFiles.includes(change.path)
  );
  
  checks.push({
    name: 'Non-Interference',
    type: 'non_interference',
    passed: !deletingCritical,
    message: deletingCritical 
      ? 'BLOCKED: Attempting to delete critical system files'
      : 'No critical files affected',
    evidence: { criticalFiles, changeCount: plan.changes.length }
  });
  
  // Check 3: Monotonic Safety
  // Ensure no security regressions
  const hasSecurityImplications = plan.changes.some(
    change => /auth|security|crypto|secret/i.test(change.path)
  );
  
  checks.push({
    name: 'Monotonic Safety',
    type: 'monotonic_safety',
    passed: !hasSecurityImplications || plan.risks.some(r => r.category === 'security'),
    message: hasSecurityImplications
      ? 'Security-sensitive files detected - additional validation required'
      : 'No security implications detected',
    evidence: { securitySensitive: hasSecurityImplications }
  });
  
  // Check 4: Burden Reduction
  // Ensure changes actually reduce burden (don't add complexity)
  const addingFiles = plan.changes.filter(c => c.operation === 'create').length;
  const totalFiles = plan.changes.length;
  
  const burdenScore = addingFiles / Math.max(totalFiles, 1);
  
  checks.push({
    name: 'Burden Reduction',
    type: 'burden_reduction',
    passed: burdenScore < 0.8, // Less than 80% new files
    message: burdenScore >= 0.8
      ? 'WARN: Adding significant new files - may increase burden'
      : 'Changes appear to reduce or maintain burden',
    evidence: { addingFiles, totalFiles, burdenScore }
  });
  
  const allPassed = checks.every(check => check.passed);
  
  logger.info('Invariant check complete', {
    allPassed,
    checkCount: checks.length,
    failed: checks.filter(c => !c.passed).map(c => c.name)
  });
  
  return {
    allPassed,
    checks,
    timestamp: new Date().toISOString()
  };
}

/**
 * Execute policy via GitHub API
 * 
 * Commits changes to repository using GitHub API
 */
async function commitToGitHub(
  changes: FileChange[],
  message: string,
  canonHash: string,
  policyId: string
): Promise<CommitInfo> {
  if (!isGitHubConfigured()) {
    logger.warn('GitHub not configured - simulating commit');
    return {
      message,
      files: changes.map(c => c.path),
      timestamp: new Date().toISOString(),
      author: 'bickford-system',
      sha: 'simulated-' + Date.now()
    };
  }
  
  const fullMessage = `BICKFORD AUTO-COMMIT\n\n` +
    `Intent: ${message}\n` +
    `Canon: ${canonHash.substring(0, 16)}...\n` +
    `Policy: ${policyId}\n` +
    `Branch: ${GITHUB_BRANCH}\n\n` +
    `${changes.map(c => `${c.operation}: ${c.path}`).join('\n')}\n`;
  
  logger.info('Committing to GitHub', {
    repo: GITHUB_REPO,
    branch: GITHUB_BRANCH,
    fileCount: changes.length
  });
  
  try {
    const { owner, repo } = parseRepo(GITHUB_REPO);

    // 1) Resolve branch ref -> base commit SHA
    const ref = await githubJson<{ object: { sha: string } }>(
      'GET',
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(GITHUB_BRANCH)}`,
    );
    const baseSha = ref.object.sha;

    // 2) Load base commit -> base tree SHA
    const baseCommit = await githubJson<{ tree: { sha: string } }>(
      'GET',
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits/${baseSha}`,
    );
    const baseTreeSha = baseCommit.tree.sha;

    // 3) Create blobs + build tree entries
    const tree: Array<{ path: string; mode: string; type: 'blob'; sha: string }> = [];

    for (const change of changes) {
      if (change.operation === 'delete') {
        throw new Error(`Delete operations are not supported by the auto-commit runtime: ${change.path}`);
      }
      if (typeof change.preview !== 'string') {
        throw new Error(`Missing file content for ${change.operation} ${change.path}`);
      }

      const blob = await githubJson<{ sha: string }>(
        'POST',
        `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/blobs`,
        { content: change.preview, encoding: 'utf-8' },
      );

      tree.push({
        path: change.path.replace(/^\//, ''),
        mode: '100644',
        type: 'blob',
        sha: blob.sha,
      });
    }

    // 4) Create new tree
    const newTree = await githubJson<{ sha: string }>(
      'POST',
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/trees`,
      { base_tree: baseTreeSha, tree },
    );

    // 5) Create commit
    const commit = await githubJson<{ sha: string }>(
      'POST',
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/commits`,
      { message: fullMessage, tree: newTree.sha, parents: [baseSha] },
    );

    // 6) Update branch ref
    await githubJson(
      'PATCH',
      `${GITHUB_API_BASE}/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(GITHUB_BRANCH)}`,
      { sha: commit.sha, force: false },
    );

    const commitInfo: CommitInfo = {
      sha: commit.sha,
      message: fullMessage,
      files: changes.map(c => c.path),
      timestamp: new Date().toISOString(),
      author: 'bickford-system',
      url: `https://github.com/${GITHUB_REPO}/commit/${commit.sha}`,
    };

    logger.info('GitHub commit created', { sha: commitInfo.sha });
    return commitInfo;
  } catch (error: any) {
    logger.error('GitHub commit failed', { error: error.message });
    throw new Error(`GitHub commit failed: ${error.message}`);
  }
}

/**
 * Execute policy with full workflow
 * 
 * 1. Generate execution plan
 * 2. Check invariants
 * 3. If admissible, commit to GitHub
 * 4. Append to ledger
 */
export async function executePolicy(binding: PolicyBinding): Promise<ExecutionResult> {
  const startTime = Date.now();
  
  logger.info('Executing policy', {
    policyId: binding.policy.id,
    intentType: binding.intent.intentType
  });
  
  try {
    // Step 1: Generate execution plan
    const plan = generateExecutionPlan(binding);
    
    // Step 2: Check invariants
    const invariantResult = checkInvariants(plan);
    
    if (!invariantResult.allPassed) {
      // Invariant violation - DENY
      const failedChecks = invariantResult.checks.filter(c => !c.passed);
      const reasoning = 'Invariant violation: ' + 
        failedChecks.map(c => c.message).join('; ');
      
      const result: ExecutionResult = {
        success: false,
        status: 'DENIED',
        intent: binding.intent,
        policyBinding: binding,
        executionPlan: plan,
        commits: [],
        ledgerEntry: appendLedger(
          binding.intent,
          binding.policy.id,
          loadCanon().meta.sha256,
          'DENY',
          reasoning
        ),
        error: reasoning,
        timestamp: new Date().toISOString(),
        durationMs: Date.now() - startTime
      };
      
      logger.warn('Execution denied', { reasoning });
      return result;
    }
    
    // Step 3: Execute (commit to GitHub)
    const commits: CommitInfo[] = [];
    
    if (plan.changes.length > 0) {
      // Write local artifacts best-effort (supports file-based ledger + dev inspection)
      for (const change of plan.changes) {
        if (change.operation === 'create' || change.operation === 'modify') {
          if (typeof change.preview === 'string') {
            try {
              ensureDirForFile(change.path);
              fs.writeFileSync(path.join(process.cwd(), change.path), change.preview, 'utf-8');
            } catch (e: any) {
              logger.warn('Failed to write local execution artifact (best-effort)', {
                path: change.path,
                error: e?.message || String(e),
              });
            }
          }
        }
      }

      const canon = loadCanon();
      const commit = await commitToGitHub(
        plan.changes,
        binding.intent.rawText,
        canon.meta.sha256,
        binding.policy.id
      );
      commits.push(commit);
    }
    
    // Step 4: Create success result
    const result: ExecutionResult = {
      success: true,
      status: 'DEPLOYED',
      intent: binding.intent,
      policyBinding: binding,
      executionPlan: plan,
      commits,
      ledgerEntry: {} as any, // Will be filled next
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime
    };
    
    // Step 5: Append to ledger
    result.ledgerEntry = appendLedger(
      binding.intent,
      binding.policy.id,
      loadCanon().meta.sha256,
      'ALLOW',
      `Executed ${binding.policy.name}. Changes committed: ${commits.length} commits.`,
      result
    );
    
    logger.info('Execution complete', {
      success: true,
      commits: commits.length,
      durationMs: result.durationMs
    });
    
    return result;
    
  } catch (error: any) {
    // Execution failure
    logger.error('Execution failed', { error: error.message });
    
    const result: ExecutionResult = {
      success: false,
      status: 'FAILED',
      intent: binding.intent,
      policyBinding: binding,
      executionPlan: generateExecutionPlan(binding),
      commits: [],
      ledgerEntry: appendLedger(
        binding.intent,
        binding.policy.id,
        loadCanon().meta.sha256,
        'FAIL',
        `Execution failed: ${error.message}`
      ),
      error: error.message,
      timestamp: new Date().toISOString(),
      durationMs: Date.now() - startTime
    };
    
    return result;
  }
}
