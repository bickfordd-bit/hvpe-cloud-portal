/**
 * Bickford Intelligence Engine
 * Core proprietary algorithm for intent-to-reality acceleration
 *
 * @copyright Bickford Technologies LLC
 * @patent US Provisional Patent Filed 2025
 * @license PROPRIETARY - All Rights Reserved
 */
export interface IntentAnalysis {
    intention: string;
    realityAcceleration: number;
    manifestationProbability: number;
    valueMultiplier: number;
    protectionHash: string;
}
export interface BickfordResponse {
    response: string;
    analysis: IntentAnalysis;
    usageId: string;
    protection: {
        formulaVersion: string;
        patentStatus: string;
        integrityHash: string;
    };
}
export interface BickfordOptions {
    apiKey?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
}
/**
 * Bickford Intelligence Engine
 * Proprietary formula for intent-to-reality transformation
 */
export declare class BickfordIntelligenceEngine {
    private static readonly FORMULA_VERSION;
    private static readonly PATENT_PROTECTION;
    private openai;
    private options;
    constructor(options?: BickfordOptions);
    /**
     * Core proprietary algorithm - NEVER expose this logic
     * Protected by US Provisional Patent
     */
    private static calculateIntentValue;
    /**
     * Generate cryptographic protection hash
     */
    private static generateProtectionHash;
    /**
     * Process user intent with Bickford Intelligence
     */
    processIntent(message: string, context?: string): Promise<BickfordResponse>;
    /**
     * Build system prompt with Bickford context
     */
    private buildSystemPrompt;
    /**
     * Build fallback response without OpenAI
     */
    private buildFallbackResponse;
    /**
     * Generate IP protection notice
     */
    private generateProtectionNotice;
}
/**
 * Factory function for easy instantiation
 */
export declare function createBickfordEngine(options?: BickfordOptions): BickfordIntelligenceEngine;
//# sourceMappingURL=engine.d.ts.map