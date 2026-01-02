/**
 * @bickfordd-bit/bickford
 * 
 * Bickford Intelligence Engine - Intent-to-Reality acceleration framework
 * with unified AI agent system.
 * 
 * @copyright Bickford Technologies LLC
 * @patent US Provisional Patent Filed 2025
 * @license PROPRIETARY - All Rights Reserved
 */

// Core engine
export {
  BickfordIntelligenceEngine,
  createBickfordEngine,
  type IntentAnalysis,
  type BickfordResponse,
  type BickfordOptions,
} from './engine';

// Knowledge base
export {
  BICKFORD_KNOWLEDGE_PACKAGE,
  formatBickfordKnowledgePackage,
  formatBickfordModeSummary,
  type BickfordMode,
} from './knowledge';

// Unified agent
export {
  UNIFIED_AGENT_ID,
  buildUnifiedAgentPrompt,
  buildModePrompt,
  type UnifiedAgentOptions,
} from './agent';

// Version and metadata
export const BICKFORD_VERSION = '1.0.0';
export const FORMULA_VERSION = 'BICKFORD_V1.0_PROPRIETARY';
export const PATENT_STATUS = 'US_PROVISIONAL_PATENT_FILED_2025';
