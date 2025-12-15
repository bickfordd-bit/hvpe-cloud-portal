export function renderMarkdownReport({ ts, result, signals }: any) {
  return `# BICK Report

**Timestamp:** ${ts}

## BICK_planner
- **BICK:** ${result.BICK_planner.toFixed(6)}
- **Base value rate:** ${result.components.base_value_rate.toFixed(6)}
- **Defensibility:** ${result.components.defensibility_scalar.toFixed(3)}
- **Cognitive load (C):** ${result.components.cognitive_load_C.toFixed(2)}

## Counts
- Done items: ${result.counts.done}
- Total items considered: ${result.counts.total}

## Next Best Actions
${result.nextBestActions.map((a: string) => `- ${a}`).join("\n")}

## Raw Signals (summary)
- Untriaged: ${signals.cognitive.U_untriaged}
- Blocked: ${signals.cognitive.B_blocked}
`;
}
