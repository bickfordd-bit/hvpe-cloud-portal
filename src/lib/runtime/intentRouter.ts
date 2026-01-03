/**
 * Intent Router
 * Pattern-based routing to workflow branches
 */

import type { RouteResult } from "@/types/filing";

const BRANCH_PATTERNS: Record<string, string[]> = {
  "dod-pilot": ["dod", "compliance", "cmmc", "defense", "military"],
  "aws-sim": ["aws", "infrastructure", "deploy", "cloud", "kubernetes"],
  "product-ui": ["ui", "interface", "design", "component", "frontend"],
  investor: ["pitch", "demo", "investor", "revenue", "valuation"],
};

/**
 * Route an intent to a branch based on keyword matching
 */
export function routeIntent(text: string): RouteResult {
  const lower = text.toLowerCase();

  for (const [branch, keywords] of Object.entries(BRANCH_PATTERNS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return { branchId: branch, confidence: 0.9 };
    }
  }

  // Default to product-ui if no match
  return { branchId: "product-ui", confidence: 0.5 };
}
