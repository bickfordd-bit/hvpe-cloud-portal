/**
 * OPTR Runtime Tests
 */

import {
  initOPTR,
  applyValue,
  applyBranchValue,
  getBranchStats,
  computeTTV,
  resetOPTR,
} from "../optr";

describe("OPTR Runtime", () => {
  beforeEach(() => {
    resetOPTR();
  });

  describe("initOPTR", () => {
    it("should initialize OPTR state with goal value", () => {
      const state = initOPTR(100);

      expect(state.goalValue).toBe(100);
      expect(state.realizedValue).toBe(0);
      expect(state.timestamp).toBeLessThanOrEqual(Date.now());
    });
  });

  describe("applyValue", () => {
    it("should apply value delta and return metrics", () => {
      const state = initOPTR(10);
      const result = applyValue(state, 2.5);

      expect(state.realizedValue).toBe(2.5);
      expect(result.progress).toBe(0.25); // 2.5 / 10
      expect(result.ttv).toBeGreaterThan(0);
    });

    it("should accumulate multiple value deltas", () => {
      const state = initOPTR(10);
      applyValue(state, 2);
      applyValue(state, 3);
      const result = applyValue(state, 1);

      expect(state.realizedValue).toBe(6);
      expect(result.progress).toBe(0.6); // 6 / 10
    });
  });

  describe("computeTTV", () => {
    it("should return baseline TTV when no progress", () => {
      const state = initOPTR(10);
      const ttv = computeTTV(state);

      expect(ttv).toBe(5000); // Baseline 5 seconds
    });

    it("should compute TTV based on progress", () => {
      const state = initOPTR(10);
      state.realizedValue = 5; // 50% progress
      state.timestamp = Date.now() - 1000; // 1 second elapsed

      const ttv = computeTTV(state);

      // Projected time = 1000ms / 0.5 = 2000ms
      expect(ttv).toBeCloseTo(2000, -2);
    });

    it("should enforce minimum TTV of 100ms", () => {
      const state = initOPTR(10);
      state.realizedValue = 10; // 100% progress
      state.timestamp = Date.now() - 10; // 10ms elapsed

      const ttv = computeTTV(state);

      expect(ttv).toBeGreaterThanOrEqual(100);
    });
  });

  describe("applyBranchValue", () => {
    it("should create branch state on first access", () => {
      const result = applyBranchValue("test-branch", 2);

      expect(result.branchId).toBe("test-branch");
      expect(result.ttv).toBeGreaterThan(0);
      expect(result.progress).toBeGreaterThan(0);
    });

    it("should track separate state for each branch", () => {
      const result1 = applyBranchValue("branch-1", 3);
      const result2 = applyBranchValue("branch-2", 5);

      expect(result1.branchId).toBe("branch-1");
      expect(result2.branchId).toBe("branch-2");
      expect(result1.progress).not.toBe(result2.progress);
    });

    it("should accumulate values within same branch", () => {
      applyBranchValue("branch-1", 2);
      const result = applyBranchValue("branch-1", 3);

      expect(result.progress).toBe(0.5); // (2 + 3) / 10
    });
  });

  describe("getBranchStats", () => {
    it("should return empty array when no branches", () => {
      const stats = getBranchStats();

      expect(stats).toEqual([]);
    });

    it("should return stats for all branches", () => {
      applyBranchValue("branch-1", 2);
      applyBranchValue("branch-2", 5);

      const stats = getBranchStats();

      expect(stats.length).toBe(2);
      expect(stats.find((s) => s.branchId === "branch-1")).toBeDefined();
      expect(stats.find((s) => s.branchId === "branch-2")).toBeDefined();
    });
  });
});
