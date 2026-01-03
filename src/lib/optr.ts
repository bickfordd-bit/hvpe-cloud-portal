/**
 * OPTR Policy Selector
 * 
 * Implements OPTR (Operational Throughput) policy selection algorithm.
 * Computes optimal policy binding based on T2V minimization.
 */

import { Intent, Policy, PolicyBinding, OPTRScore, Canon } from './types';
import { logger } from './logger';

/**
 * Default OPTR weights for scoring
 */
const DEFAULT_WEIGHTS = {
  ttv: 1.0,           // Base weight for time-to-value
  risk: 0.3,          // λ_R: Risk penalty weight
  cogLoad: 0.2,       // λ_C: Cognitive load penalty
  autoGain: 0.5       // λ_A: Automation gain bonus
};

/**
 * Policy definitions for different intent types
 */
const POLICY_CATALOG: Policy[] = [
  {
    id: 'auto-feature-add',
    name: 'Automatic Feature Addition',
    description: 'Auto-generates and commits new feature code',
    applicableIntentTypes: ['feature'],
    optrScore: {
      ttv: 120,           // ~2 minutes
      risk: 0.4,          // Medium risk
      cognitiveLoad: 0.3, // Low cognitive load
      automationGain: 0.8,// High automation gain
      totalScore: 0
    },
    constraints: [
      {
        type: 'canon_compliance',
        description: 'Must not violate canonical rules',
        checkFn: 'checkCanonCompliance'
      },
      {
        type: 'non_interference',
        description: 'Must not break existing features',
        checkFn: 'checkNonInterference'
      }
    ],
    actions: [
      {
        type: 'file_write',
        description: 'Generate new feature files',
        params: { template: 'feature', testing: true }
      },
      {
        type: 'git_commit',
        description: 'Commit changes to repository',
        params: { branch: 'main', autoMerge: true }
      }
    ]
  },
  {
    id: 'auto-bugfix',
    name: 'Automatic Bug Fix',
    description: 'Identifies and fixes bugs automatically',
    applicableIntentTypes: ['bugfix'],
    optrScore: {
      ttv: 90,            // ~1.5 minutes
      risk: 0.3,          // Lower risk (fixes issues)
      cognitiveLoad: 0.2, // Very low cognitive load
      automationGain: 0.9,// Very high automation gain
      totalScore: 0
    },
    constraints: [
      {
        type: 'canon_compliance',
        description: 'Fix must preserve canon',
        checkFn: 'checkCanonCompliance'
      },
      {
        type: 'monotonic_safety',
        description: 'Fix must improve or maintain safety',
        checkFn: 'checkMonotonicSafety'
      }
    ],
    actions: [
      {
        type: 'file_write',
        description: 'Apply bug fix',
        params: { validateFix: true }
      },
      {
        type: 'git_commit',
        description: 'Commit bug fix',
        params: { branch: 'main' }
      }
    ]
  },
  {
    id: 'auto-refactor',
    name: 'Automatic Refactoring',
    description: 'Refactors code for better structure',
    applicableIntentTypes: ['refactor'],
    optrScore: {
      ttv: 180,           // ~3 minutes
      risk: 0.5,          // Higher risk (structural change)
      cognitiveLoad: 0.4, // Medium cognitive load
      automationGain: 0.6,// Medium automation gain
      totalScore: 0
    },
    constraints: [
      {
        type: 'canon_compliance',
        description: 'Refactor must preserve canon',
        checkFn: 'checkCanonCompliance'
      },
      {
        type: 'non_interference',
        description: 'Refactor must not break functionality',
        checkFn: 'checkNonInterference'
      }
    ],
    actions: [
      {
        type: 'file_write',
        description: 'Apply refactoring',
        params: { preserveBehavior: true }
      },
      {
        type: 'git_commit',
        description: 'Commit refactored code',
        params: { branch: 'main' }
      }
    ]
  },
  {
    id: 'auto-docs',
    name: 'Automatic Documentation',
    description: 'Generates or updates documentation',
    applicableIntentTypes: ['docs'],
    optrScore: {
      ttv: 60,            // ~1 minute
      risk: 0.1,          // Very low risk
      cognitiveLoad: 0.1, // Very low cognitive load
      automationGain: 0.95,// Very high automation gain
      totalScore: 0
    },
    constraints: [
      {
        type: 'canon_compliance',
        description: 'Docs must align with canon',
        checkFn: 'checkCanonCompliance'
      }
    ],
    actions: [
      {
        type: 'file_write',
        description: 'Write documentation',
        params: { format: 'markdown' }
      },
      {
        type: 'git_commit',
        description: 'Commit documentation',
        params: { branch: 'main' }
      }
    ]
  },
  {
    id: 'auto-config',
    name: 'Automatic Configuration',
    description: 'Updates configuration files',
    applicableIntentTypes: ['config'],
    optrScore: {
      ttv: 45,            // ~45 seconds
      risk: 0.6,          // Higher risk (can break deployment)
      cognitiveLoad: 0.3, // Low cognitive load
      automationGain: 0.7,// Good automation gain
      totalScore: 0
    },
    constraints: [
      {
        type: 'canon_compliance',
        description: 'Config must preserve canon',
        checkFn: 'checkCanonCompliance'
      },
      {
        type: 'monotonic_safety',
        description: 'Config must maintain or improve safety',
        checkFn: 'checkMonotonicSafety'
      }
    ],
    actions: [
      {
        type: 'file_write',
        description: 'Update configuration',
        params: { validate: true }
      },
      {
        type: 'git_commit',
        description: 'Commit configuration',
        params: { branch: 'main' }
      }
    ]
  },
  {
    id: 'manual-review',
    name: 'Manual Review Required',
    description: 'Intent requires human review before execution',
    applicableIntentTypes: ['feature', 'bugfix', 'refactor', 'config', 'deploy'],
    optrScore: {
      ttv: 3600,          // ~1 hour (includes review time)
      risk: 0.2,          // Lower risk due to review
      cognitiveLoad: 0.8, // High cognitive load
      automationGain: 0.1,// Low automation gain
      totalScore: 0
    },
    constraints: [
      {
        type: 'burden_reduction',
        description: 'Review burden must be justified',
        checkFn: 'checkBurdenReduction'
      }
    ],
    actions: [
      {
        type: 'notification',
        description: 'Notify reviewer',
        params: { channel: 'slack', urgent: false }
      }
    ]
  }
];

/**
 * Compute OPTR score for a policy given an intent
 */
function computeOPTRScore(
  policy: Policy,
  intent: Intent,
  weights = DEFAULT_WEIGHTS
): OPTRScore {
  const base = policy.optrScore;
  
  // Adjust scores based on intent metadata
  let riskMultiplier = 1.0;
  let cogLoadMultiplier = 1.0;
  
  if (intent.metadata?.priority === 'high') {
    // High priority reduces acceptable TTV
    cogLoadMultiplier = 1.2;
  }
  
  if (intent.metadata?.breaking) {
    // Breaking changes increase risk
    riskMultiplier = 1.5;
  }
  
  if (intent.metadata?.complexity === 'complex') {
    // Complex changes increase cognitive load
    cogLoadMultiplier = 1.3;
  }
  
  const adjustedRisk = Math.min(base.risk * riskMultiplier, 1.0);
  const adjustedCogLoad = Math.min(base.cognitiveLoad * cogLoadMultiplier, 1.0);
  
  // Calculate total score using OPTR formula:
  // minimize: TTV + λ_R·Risk + λ_C·CogLoad - λ_A·AutoGain
  const totalScore = 
    (base.ttv * weights.ttv) +
    (adjustedRisk * weights.risk * 1000) +     // Scale risk to time units
    (adjustedCogLoad * weights.cogLoad * 1000) - // Scale cogLoad to time units
    (base.automationGain * weights.autoGain * 1000); // Scale autoGain bonus
  
  return {
    ttv: base.ttv,
    risk: adjustedRisk,
    cognitiveLoad: adjustedCogLoad,
    automationGain: base.automationGain,
    totalScore
  };
}

/**
 * Select optimal policy for given intent
 * 
 * Implements OPTR policy selection: choose policy that minimizes
 * TTV + λ_R·Risk + λ_C·CogLoad - λ_A·AutoGain
 */
export function computeOPTR(intent: Intent, canon: Canon): PolicyBinding {
  logger.info('Computing OPTR policy selection', {
    intentType: intent.intentType,
    confidence: intent.confidence
  });
  
  // Filter policies applicable to this intent type
  const applicablePolicies = POLICY_CATALOG.filter(policy =>
    policy.applicableIntentTypes.includes(intent.intentType)
  );
  
  if (applicablePolicies.length === 0) {
    logger.warn('No applicable policies found', { intentType: intent.intentType });
    throw new Error(`No policy available for intent type: ${intent.intentType}`);
  }
  
  // Compute OPTR score for each applicable policy
  const scoredPolicies = applicablePolicies.map(policy => ({
    policy,
    score: computeOPTRScore(policy, intent)
  }));
  
  // Select policy with minimum total score (best OPTR)
  scoredPolicies.sort((a, b) => a.score.totalScore - b.score.totalScore);
  const selected = scoredPolicies[0];
  
  // Calculate confidence based on score difference
  const scoreDiff = scoredPolicies.length > 1
    ? scoredPolicies[1].score.totalScore - selected.score.totalScore
    : selected.score.totalScore;
  
  const confidence = Math.min(
    0.5 + (scoreDiff / 1000), // Higher score difference = higher confidence
    0.95
  );
  
  // Generate reasoning
  const reasoning = generateReasoning(selected.policy, selected.score, intent);
  
  const binding: PolicyBinding = {
    policy: selected.policy,
    intent,
    confidence,
    selectedAt: new Date().toISOString(),
    reasoning
  };
  
  logger.info('Policy selected', {
    policyId: selected.policy.id,
    confidence,
    totalScore: selected.score.totalScore,
    ttv: selected.score.ttv
  });
  
  return binding;
}

/**
 * Generate human-readable reasoning for policy selection
 */
function generateReasoning(policy: Policy, score: OPTRScore, intent: Intent): string {
  const parts = [
    `Selected "${policy.name}" based on OPTR optimization.`,
    `Estimated time-to-value: ${score.ttv}s.`,
    `Risk level: ${(score.risk * 100).toFixed(0)}%.`,
    `Automation gain: ${(score.automationGain * 100).toFixed(0)}%.`
  ];
  
  if (intent.metadata?.priority === 'high') {
    parts.push('High priority intent - expedited processing.');
  }
  
  if (intent.metadata?.breaking) {
    parts.push('Breaking change detected - additional validation required.');
  }
  
  return parts.join(' ');
}

/**
 * Get policy by ID
 */
export function getPolicyById(id: string): Policy | undefined {
  return POLICY_CATALOG.find(p => p.id === id);
}

/**
 * List all available policies
 */
export function listPolicies(): Policy[] {
  return [...POLICY_CATALOG];
}

/**
 * Get policies for specific intent type
 */
export function getPoliciesForIntentType(intentType: Intent['intentType']): Policy[] {
  return POLICY_CATALOG.filter(p => p.applicableIntentTypes.includes(intentType));
}
