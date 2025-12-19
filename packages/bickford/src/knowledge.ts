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

export const BICKFORD_KNOWLEDGE_PACKAGE = {
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
export function formatBickfordKnowledgePackage(): string {
  const lines: string[] = ['BICKFORD KNOWLEDGE PACKAGE'];

  lines.push('\nIdentity:');
  BICKFORD_KNOWLEDGE_PACKAGE.identity.forEach((item) => lines.push(`- ${item}`));

  lines.push('\nOperating Principles:');
  BICKFORD_KNOWLEDGE_PACKAGE.operatingPrinciples.forEach((item) =>
    lines.push(`- ${item}`)
  );

  lines.push('\nLanguage:');
  BICKFORD_KNOWLEDGE_PACKAGE.bickfordLanguage.forEach((item) =>
    lines.push(`- ${item}`)
  );

  lines.push('\nGuardrails:');
  BICKFORD_KNOWLEDGE_PACKAGE.guardrails.forEach((item) => lines.push(`- ${item}`));

  return lines.join('\n');
}

/**
 * Format Bickford mode summary
 */
export function formatBickfordModeSummary(mode: BickfordMode | null): string | null {
  if (!mode) return null;

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
