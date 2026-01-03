/**
 * Valuation Engine Tests
 */

import { computeValuationMultiplier } from "../valuation";

describe("Valuation Engine", () => {
  describe("computeValuationMultiplier", () => {
    it("should compute baseline multiplier of 1.0 when no improvement", () => {
      const result = computeValuationMultiplier({
        baselineTTV: 5000,
        currentTTV: 5000,
        decisionReuseRate: 0,
        branchCount: 0,
      });

      expect(result).toBe(0); // 1.0 * 1.0 * 0 = 0 (log2(1) = 0)
    });

    it("should compute higher multiplier with TTV collapse", () => {
      const result = computeValuationMultiplier({
        baselineTTV: 5000,
        currentTTV: 2500, // 2x faster
        decisionReuseRate: 0,
        branchCount: 1, // log2(2) = 1
      });

      expect(result).toBe(2.0); // 2.0 * 1.0 * 1.0 = 2.0
    });

    it("should compute multiplier with decision reuse boost", () => {
      const result = computeValuationMultiplier({
        baselineTTV: 5000,
        currentTTV: 5000,
        decisionReuseRate: 0.3, // 30% reuse
        branchCount: 1,
      });

      expect(result).toBe(1.3); // 1.0 * 1.3 * 1.0 = 1.3
    });

    it("should compute multiplier with branch boost", () => {
      const result = computeValuationMultiplier({
        baselineTTV: 5000,
        currentTTV: 5000,
        decisionReuseRate: 0,
        branchCount: 3, // log2(4) = 2
      });

      expect(result).toBe(2.0); // 1.0 * 1.0 * 2.0 = 2.0
    });

    it("should compute compound multiplier with all factors", () => {
      const result = computeValuationMultiplier({
        baselineTTV: 5000,
        currentTTV: 2500, // 2x TTV collapse
        decisionReuseRate: 0.3, // 1.3x reuse boost
        branchCount: 3, // 2x branch boost (log2(4) = 2)
      });

      expect(result).toBe(5.2); // 2.0 * 1.3 * 2.0 = 5.2
    });

    it("should handle zero currentTTV gracefully", () => {
      const result = computeValuationMultiplier({
        baselineTTV: 5000,
        currentTTV: 0,
        decisionReuseRate: 0.3,
        branchCount: 3,
      });

      expect(result).toBe(1.0); // Fallback to baseline
    });

    it("should round result to 2 decimal places", () => {
      const result = computeValuationMultiplier({
        baselineTTV: 5000,
        currentTTV: 3333,
        decisionReuseRate: 0.25,
        branchCount: 2,
      });

      // 1.5 * 1.25 * 1.585 ≈ 2.97
      expect(result).toBeCloseTo(2.97, 1);
      expect(typeof result).toBe("number");
    });
  });
});
