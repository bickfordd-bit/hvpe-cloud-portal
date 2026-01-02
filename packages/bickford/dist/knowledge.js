"use strict";
/**
 * Bickford Knowledge Package
 * Core identity, principles, and operating guidelines
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BICKFORD_KNOWLEDGE_PACKAGE = void 0;
exports.formatBickfordKnowledgePackage = formatBickfordKnowledgePackage;
exports.formatBickfordModeSummary = formatBickfordModeSummary;
exports.BICKFORD_KNOWLEDGE_PACKAGE = {
    identity: [
        'Bickford Technologies: intent-to-reality acceleration platform.',
        'HVPE (High Velocity Profit Engine) powers automated trading, objective execution, and decision orchestration.',
        'OPTR (Opportunity Targeting & Response) structures capture strategy with R/E/P/S phases.',
    ],
    operatingPrinciples: [
        'Prioritize execution clarity over hype.',
        'Prefer system integrations that reduce friction and accelerate value delivery.',
        'Respect IP boundaries: never reveal proprietary formulas or protected logic.',
    ],
    bickfordLanguage: [
        'Intent → Constraints → Systems → Execution path.',
        'Reality acceleration, manifestation probability, and value multiplier framing.',
        'Decision continuity with timestamped authority.',
    ],
    guardrails: [
        'Never claim to execute real-world actions.',
        'Flag high-risk scenarios and request missing data.',
        'Stay concise, precise, and operational.',
    ],
};
/**
 * Format knowledge package as text
 */
function formatBickfordKnowledgePackage() {
    const lines = ['BICKFORD KNOWLEDGE PACKAGE'];
    lines.push('\nIdentity:');
    exports.BICKFORD_KNOWLEDGE_PACKAGE.identity.forEach((item) => lines.push(`- ${item}`));
    lines.push('\nOperating Principles:');
    exports.BICKFORD_KNOWLEDGE_PACKAGE.operatingPrinciples.forEach((item) => lines.push(`- ${item}`));
    lines.push('\nLanguage:');
    exports.BICKFORD_KNOWLEDGE_PACKAGE.bickfordLanguage.forEach((item) => lines.push(`- ${item}`));
    lines.push('\nGuardrails:');
    exports.BICKFORD_KNOWLEDGE_PACKAGE.guardrails.forEach((item) => lines.push(`- ${item}`));
    return lines.join('\n');
}
/**
 * Format Bickford mode summary
 */
function formatBickfordModeSummary(mode) {
    if (!mode)
        return null;
    const flags = Object.entries(mode.flags)
        .map(([key, value]) => `${key}: ${value ? 'ENABLED' : 'DISABLED'}`)
        .join('\n');
    return [
        'BICKFORD MODE',
        `Timestamp: ${mode.ts}`,
        `Authority Rule: ${mode.authority.rule}`,
        `Authority Locked: ${mode.authority.locked}`,
        'Flags:',
        flags,
    ].join('\n');
}
//# sourceMappingURL=knowledge.js.map