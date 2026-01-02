/**
 * Unified Agent System
 * Centralizes prompt construction across all chat endpoints
 */
import { BickfordMode } from './knowledge';
export declare const UNIFIED_AGENT_ID = "bickford-unified";
export interface UnifiedAgentOptions {
    specialization?: string;
    context?: string;
    capabilities?: string[];
    constraints?: string[];
    mode?: string;
    bickfordMode?: BickfordMode | null;
}
/**
 * Build a unified system prompt for any agent specialization
 */
export declare function buildUnifiedAgentPrompt(options: UnifiedAgentOptions): string;
/**
 * Build prompt for specific agent mode
 */
export declare function buildModePrompt(mode: string, context?: any, bickfordMode?: BickfordMode | null): string;
//# sourceMappingURL=agent.d.ts.map