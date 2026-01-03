/**
 * Bickford Homepage — Execute API
 * 
 * Zero-approval execution runtime endpoint.
 * Implements full OPTR workflow: intent → policy → execution → ledger
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseIntent, validateIntent } from '@/lib/intent';
import { loadCanon } from '@/lib/canon';
import { computeOPTR } from '@/lib/optr';
import { executePolicy, generateExecutionPlan, checkInvariants } from '@/lib/executor';
import { ExecuteRequest, ExecuteResponse } from '@/lib/types';
import { logger } from '@/lib/logger';

export const dynamic = 'force-dynamic';

/**
 * POST /api/execute
 * 
 * Execute an intent through the OPTR pipeline
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse request body
    const body = await req.json() as ExecuteRequest;
    
    logger.info('Execute request received', {
      intentLength: body.intent?.length || 0,
      dryRun: body.dryRun || false
    });
    
    // Validate request
    if (!body.intent || typeof body.intent !== 'string') {
      return NextResponse.json({
        success: false,
        error: 'Missing or invalid intent field',
        message: 'Intent must be a non-empty string'
      } as ExecuteResponse, { status: 400 });
    }
    
    // Step 1: Load and verify canon
    logger.info('Step 1: Loading canon');
    let canon;
    try {
      canon = loadCanon();
      logger.info('Canon verified', { 
        version: canon.meta.version,
        hash: canon.meta.sha256.substring(0, 16) + '...' 
      });
    } catch (error: any) {
      logger.error('Canon verification failed', { error: error.message });
      return NextResponse.json({
        success: false,
        error: 'Canon integrity check failed',
        message: error.message
      } as ExecuteResponse, { status: 500 });
    }
    
    // Step 2: Parse intent
    logger.info('Step 2: Parsing intent');
    let intent;
    try {
      intent = parseIntent(body.intent);
    } catch (error: any) {
      logger.error('Intent parsing failed', { error: error.message });
      return NextResponse.json({
        success: false,
        error: 'Failed to parse intent',
        message: error.message
      } as ExecuteResponse, { status: 400 });
    }
    
    // Validate intent
    const validation = validateIntent(intent);
    if (!validation.valid) {
      logger.warn('Intent validation failed', { reason: validation.reason });
      return NextResponse.json({
        success: false,
        error: 'Invalid intent',
        message: validation.reason || 'Intent did not pass validation'
      } as ExecuteResponse, { status: 400 });
    }
    
    // Step 3: Run OPTR policy selection
    logger.info('Step 3: Computing OPTR policy');
    let policyBinding;
    try {
      policyBinding = computeOPTR(intent, canon);
    } catch (error: any) {
      logger.error('OPTR computation failed', { error: error.message });
      return NextResponse.json({
        success: false,
        error: 'No applicable policy found',
        message: error.message
      } as ExecuteResponse, { status: 422 });
    }
    
    // Step 4: Generate execution plan
    logger.info('Step 4: Generating execution plan');
    const executionPlan = generateExecutionPlan(policyBinding);
    
    // Step 5: Check invariants
    logger.info('Step 5: Checking invariants');
    const invariantResult = checkInvariants(executionPlan);
    
    if (!invariantResult.allPassed) {
      const failedChecks = invariantResult.checks.filter(c => !c.passed);
      logger.warn('Invariant checks failed', {
        failed: failedChecks.map(c => c.name)
      });
      
      return NextResponse.json({
        success: false,
        error: 'Invariant violation',
        message: `Execution blocked: ${failedChecks.map(c => c.message).join('; ')}`,
        preview: executionPlan
      } as ExecuteResponse, { status: 403 });
    }
    
    // If dry run, return preview only
    if (body.dryRun) {
      logger.info('Dry run mode - returning preview');
      return NextResponse.json({
        success: true,
        preview: executionPlan,
        message: 'Dry run complete - no changes made'
      } as ExecuteResponse);
    }
    
    // Step 6: Execute policy (auto-commit)
    logger.info('Step 6: Executing policy');
    const result = await executePolicy(policyBinding);
    
    // Step 7: Return result
    const durationMs = Date.now() - startTime;
    logger.info('Execution complete', {
      success: result.success,
      status: result.status,
      durationMs
    });
    
    return NextResponse.json({
      success: result.success,
      result,
      message: result.success 
        ? `Execution successful: ${result.commits.length} commit(s) created`
        : `Execution failed: ${result.error}`
    } as ExecuteResponse);
    
  } catch (error: any) {
    const durationMs = Date.now() - startTime;
    logger.error('Execute API error', { 
      error: error.message,
      stack: error.stack,
      durationMs
    });
    
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error.message
    } as ExecuteResponse, { status: 500 });
  }
}

/**
 * GET /api/execute
 * 
 * Get API status and configuration
 */
export async function GET() {
  try {
    const canon = loadCanon();
    
    return NextResponse.json({
      status: 'operational',
      mode: 'zero-approval',
      canon: {
        version: canon.meta.version,
        hash: canon.meta.sha256.substring(0, 16) + '...',
        status: canon.meta.status
      },
      capabilities: [
        'intent_parsing',
        'optr_policy_selection',
        'invariant_checking',
        'auto_commit',
        'hash_chained_ledger'
      ]
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 });
  }
}
