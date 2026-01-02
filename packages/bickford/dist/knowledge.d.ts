/**
 * Bickford Knowledge Package
 * Core identity, principles, and operating guidelines
 */
export interface BickfordMode {
    mode: string;
    ts: string;
    flags: Record<string, boolean>;
    authority: {
        rule: string;
        locked: boolean;
    };
}
export declare const BICKFORD_KNOWLEDGE_PACKAGE: {
    identity: string[];
    operatingPrinciples: string[];
    bickfordLanguage: string[];
    guardrails: string[];
};
/**
 * Format knowledge package as text
 */
export declare function formatBickfordKnowledgePackage(): string;
/**
 * Format Bickford mode summary
 */
export declare function formatBickfordModeSummary(mode: BickfordMode | null): string | null;
//# sourceMappingURL=knowledge.d.ts.map