/**
 * Unified Agent System
 * Centralizes prompt construction across all chat endpoints
 */

import {
  formatBickfordKnowledgePackage,
  formatBickfordModeSummary,
  BickfordMode,
} from './knowledge';

export const UNIFIED_AGENT_ID = 'bickford-unified';

export interface UnifiedAgentOptions {
  specialization?: string;
  context?: string;
  capabilities?: string[];
  constraints?: string[];
  mode?: string;
  bickfordMode?: BickfordMode | null;
}

const BIGFERN_CORE_IDENTITY = `
You are BIGFERN, the unified AI agent powering the HVPE Cloud Portal.
You are the single agent for the full Bickford environment.

Core Capabilities:
- Chat assistance across all persona modes (trader, founder, investor, DoD)
- OPTR (Opportunity Targeting & Response) analysis
- Trading intelligence and risk assessment
- Financial vault management guidance
- Bickford mode specialized assistance

Behavioral Guidelines:
- Be concise, precise, and non-fluffy
- Always ground responses in data when available
- Escalate to human judgment for high-stakes decisions
- Record all interactions for audit and improvement
- Maintain context across conversation threads
`;

/**
 * Build a unified system prompt for any agent specialization
 */
export function buildUnifiedAgentPrompt(options: UnifiedAgentOptions): string {
  const {
    specialization = '',
    context = '',
    capabilities = [],
    constraints = [],
    mode = 'general',
    bickfordMode = null,
  } = options;

  let prompt = BIGFERN_CORE_IDENTITY;

  // Add Bickford knowledge package
  const knowledgePackage = formatBickfordKnowledgePackage();
  if (knowledgePackage) {
    prompt += '\n\n' + knowledgePackage;
  }

  // Add mode summary if available
  const modeSummary = formatBickfordModeSummary(bickfordMode);
  if (modeSummary) {
    prompt += '\n\n' + modeSummary;
  }

  // Add specialization (e.g., TRADER_MODE_PROMPT, OPTR_MODE_PROMPT)
  if (specialization) {
    prompt += '\n\n' + specialization;
  }

  // Add capabilities
  if (capabilities.length > 0) {
    prompt += '\n\nAdditional Capabilities:\n';
    capabilities.forEach((cap) => {
      prompt += `- ${cap}\n`;
    });
  }

  // Add constraints
  if (constraints.length > 0) {
    prompt += '\n\nConstraints:\n';
    constraints.forEach((constraint) => {
      prompt += `- ${constraint}\n`;
    });
  }

  // Add runtime context
  if (context) {
    prompt += '\n\nCurrent Context:\n' + context;
  }

  return prompt.trim();
}

/**
 * Build prompt for specific agent mode
 */
export function buildModePrompt(
  mode: string,
  context?: unknown,
  bickfordMode?: BickfordMode | null
): string {
  const baseOptions: UnifiedAgentOptions = { mode, bickfordMode };

  switch (mode) {
    case 'trader':
      return buildUnifiedAgentPrompt({
        ...baseOptions,
        specialization:
          'You are operating in TRADER mode. Focus on: engine state, risk levels, P/L analysis, position management, and trading velocity.',
        capabilities: [
          'Interpret trading metrics and dashboard state',
          'Explain risk/reward tradeoffs',
          'Suggest parameter adjustments',
          'Monitor vault performance',
        ],
        constraints: [
          'Never execute trades directly',
          'Always explain reasoning for suggestions',
          'Flag high-risk scenarios explicitly',
        ],
      });

    case 'optr':
      return buildUnifiedAgentPrompt({
        ...baseOptions,
        specialization:
          'You are OPTR, the Opportunity Targeting & Response engine. Focus on: opportunity analysis, fit scoring, gap assessment, and win strategy.',
        capabilities: [
          'Analyze opportunities across R/E/P/S phases',
          'Score opportunities against capabilities',
          'Identify gaps and recommend responses',
          'Build pursuit strategies',
        ],
      });

    case 'bickford':
      return buildUnifiedAgentPrompt({
        ...baseOptions,
        specialization:
          'You are in BICKFORD mode, the specialized assistant for Derek Bickford. Focus on: strategic planning, system architecture, deployment decisions, and high-level goal tracking.',
        capabilities: [
          'Strategic decision support',
          'System architecture guidance',
          'Deployment and operations advice',
          'Goal tracking and progress analysis',
        ],
      });

    default:
      return buildUnifiedAgentPrompt(baseOptions);
  }
}
