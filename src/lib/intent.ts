/**
 * Intent Parser
 * 
 * Converts raw text input into structured Intent objects.
 * Uses keyword matching and pattern recognition for intent classification.
 */

import { Intent, IntentType } from './types';
import { logger } from './logger';

/**
 * Intent classification patterns
 */
const INTENT_PATTERNS: Record<IntentType, RegExp[]> = {
  feature: [
    /add\s+(a\s+)?new\s+/i,
    /create\s+(a\s+)?/i,
    /implement\s+/i,
    /build\s+/i,
    /develop\s+/i,
    /feature/i
  ],
  bugfix: [
    /fix\s+/i,
    /bug\s+/i,
    /error\s+/i,
    /issue\s+/i,
    /problem\s+/i,
    /broken\s+/i,
    /not\s+working/i
  ],
  refactor: [
    /refactor\s+/i,
    /improve\s+/i,
    /optimize\s+/i,
    /cleanup\s+/i,
    /reorganize\s+/i,
    /simplify\s+/i
  ],
  docs: [
    /document\s+/i,
    /documentation\s+/i,
    /readme\s+/i,
    /comment\s+/i,
    /explain\s+/i,
    /describe\s+/i
  ],
  config: [
    /configure\s+/i,
    /config\s+/i,
    /settings?\s+/i,
    /environment\s+/i,
    /env\s+/i,
    /setup\s+/i
  ],
  deploy: [
    /deploy\s+/i,
    /deployment\s+/i,
    /release\s+/i,
    /publish\s+/i,
    /ship\s+/i
  ],
  query: [
    /what\s+/i,
    /how\s+/i,
    /why\s+/i,
    /when\s+/i,
    /where\s+/i,
    /show\s+me\s+/i,
    /tell\s+me\s+/i,
    /explain\s+/i,
    /\?/
  ]
};

/**
 * Common code/file patterns for scope extraction
 */
const SCOPE_PATTERNS = {
  files: /(?:file|path|in)\s+[`'"']?([a-zA-Z0-9_\-./]+\.[a-z]+)[`'"']?/gi,
  modules: /(?:module|package|lib|component)\s+[`'"']?([a-zA-Z0-9_\-./]+)[`'"']?/gi,
  features: /(?:feature|area|section)\s+[`'"']?([a-zA-Z0-9_\-.\s]+)[`'"']?/gi,
  functions: /(?:function|method|class)\s+[`'"']?([a-zA-Z0-9_]+)[`'"']?/gi
};

/**
 * Classify intent type based on text patterns
 */
function classifyIntent(text: string): { type: IntentType; confidence: number } {
  const scores: Record<IntentType, number> = {
    feature: 0,
    bugfix: 0,
    refactor: 0,
    docs: 0,
    config: 0,
    deploy: 0,
    query: 0
  };
  
  // Score each intent type based on pattern matches
  for (const [intentType, patterns] of Object.entries(INTENT_PATTERNS)) {
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        scores[intentType as IntentType] += 1;
      }
    }
  }
  
  // Find highest scoring intent type
  let maxScore = 0;
  let topIntent: IntentType = 'query';
  
  for (const [intentType, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      topIntent = intentType as IntentType;
    }
  }
  
  // Calculate confidence (normalize by max possible matches)
  const maxPatterns = INTENT_PATTERNS[topIntent].length;
  const confidence = maxPatterns > 0 ? Math.min(maxScore / maxPatterns, 1.0) : 0.3;
  
  return { type: topIntent, confidence };
}

/**
 * Extract scope (affected files/modules) from intent text
 */
function extractScope(text: string): string[] {
  const scope: Set<string> = new Set();
  
  // Extract file paths
  for (const match of text.matchAll(SCOPE_PATTERNS.files)) {
    scope.add(match[1]);
  }
  
  // Extract module names
  for (const match of text.matchAll(SCOPE_PATTERNS.modules)) {
    scope.add(match[1]);
  }
  
  // Extract feature names
  for (const match of text.matchAll(SCOPE_PATTERNS.features)) {
    scope.add(match[1].trim());
  }
  
  // Extract function/class names
  for (const match of text.matchAll(SCOPE_PATTERNS.functions)) {
    scope.add(match[1]);
  }
  
  // If no specific scope found, mark as global
  if (scope.size === 0) {
    scope.add('global');
  }
  
  return Array.from(scope);
}

/**
 * Extract metadata from intent text
 */
function extractMetadata(text: string): Record<string, any> {
  const metadata: Record<string, any> = {};
  
  // Extract priority indicators
  if (/urgent|asap|critical|emergency/i.test(text)) {
    metadata.priority = 'high';
  } else if (/low\s+priority|when\s+you\s+can/i.test(text)) {
    metadata.priority = 'low';
  } else {
    metadata.priority = 'medium';
  }
  
  // Extract complexity hints
  const wordCount = text.split(/\s+/).length;
  metadata.complexity = wordCount > 50 ? 'complex' : wordCount > 20 ? 'medium' : 'simple';
  
  // Check for breaking change indicators
  metadata.breaking = /break(?:ing)?|major\s+change|incompatible/i.test(text);
  
  return metadata;
}

/**
 * Parse raw intent text into structured Intent object
 * 
 * @param text - Raw intent text from user
 * @returns {Intent} Structured intent with type, scope, and metadata
 */
export function parseIntent(text: string): Intent {
  logger.info('Parsing intent', { textLength: text.length });
  
  // Validate input
  if (!text || text.trim().length === 0) {
    throw new Error('Intent text cannot be empty');
  }
  
  const normalizedText = text.trim();
  
  // Classify intent type
  const { type, confidence } = classifyIntent(normalizedText);
  
  // Extract scope
  const scope = extractScope(normalizedText);
  
  // Extract metadata
  const metadata = extractMetadata(normalizedText);
  
  const intent: Intent = {
    rawText: normalizedText,
    intentType: type,
    scope,
    timestamp: new Date().toISOString(),
    confidence,
    metadata
  };
  
  logger.info('Intent parsed', {
    intentType: type,
    confidence,
    scopeCount: scope.length,
    priority: metadata.priority
  });
  
  return intent;
}

/**
 * Validate intent meets minimum requirements for execution
 */
export function validateIntent(intent: Intent): { valid: boolean; reason?: string } {
  // Check confidence threshold
  if (intent.confidence < 0.3) {
    return {
      valid: false,
      reason: 'Intent confidence too low. Please be more specific about what you want to do.'
    };
  }
  
  // Check for empty scope
  if (intent.scope.length === 0) {
    return {
      valid: false,
      reason: 'Could not determine scope of changes. Please specify what files or features to modify.'
    };
  }
  
  // Query intents should not proceed to execution
  if (intent.intentType === 'query' && intent.confidence > 0.7) {
    return {
      valid: false,
      reason: 'This appears to be a question, not an execution request. Please rephrase as an action.'
    };
  }
  
  return { valid: true };
}

/**
 * Format intent for display
 */
export function formatIntent(intent: Intent): string {
  return `[${intent.intentType.toUpperCase()}] ${intent.rawText} (confidence: ${(intent.confidence * 100).toFixed(0)}%)`;
}
