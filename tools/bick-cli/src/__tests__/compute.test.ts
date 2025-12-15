import { computeBick } from '../model/compute';

describe('BICK Computation', () => {
  const mockConfig = {
    weights: {
      alpha_value: 1.0,
      beta_ec: 1.0,
      gamma_t2v: 1.0,
      lambda_cognitive_load: 1.0,
      ds_power: 1.0
    },
    defensibility_snapshot: {
      dataExclusivity: 2,
      workflowLockIn: 3,
      autonomousExecution: 3,
      switchingCost: 2
    },
    value_model: {
      default_value_per_item: 100,
      priority_multiplier: {
        P0: 3.0,
        P1: 2.0,
        P2: 1.0,
        UNKNOWN: 1.0
      }
    }
  };

  it('should compute BICK score correctly', () => {
    const signals = {
      workItems: [
        {
          id: 'test-1',
          priority: 'P0' as const,
          t2vDays: 2,
          ec: 0.8,
          valueUnits: 300,
          status: 'done' as const
        },
        {
          id: 'test-2',
          priority: 'P1' as const,
          t2vDays: 4,
          ec: 0.6,
          valueUnits: 200,
          status: 'done' as const
        }
      ],
      cognitive: {
        K_openDecisions: 1,
        U_untriaged: 2,
        B_blocked: 1
      }
    };

    const result = computeBick({ signals, config: mockConfig });

    expect(result.BICK_planner).toBeGreaterThan(0);
    expect(result.components.defensibility_scalar).toBe(0.625);
    expect(result.components.cognitive_load_C).toBe(4);
    expect(result.counts.done).toBe(2);
    expect(result.counts.total).toBe(2);
  });

  it('should handle empty work items', () => {
    const signals = {
      workItems: [],
      cognitive: {
        K_openDecisions: 0,
        U_untriaged: 0,
        B_blocked: 0
      }
    };

    const result = computeBick({ signals, config: mockConfig });

    expect(result.BICK_planner).toBe(0);
    expect(result.counts.done).toBe(0);
  });

  it('should suggest actions for high cognitive load', () => {
    const signals = {
      workItems: [
        {
          id: 'test-1',
          priority: 'P1' as const,
          t2vDays: 3,
          ec: 0.6,
          valueUnits: 100,
          status: 'done' as const
        }
      ],
      cognitive: {
        K_openDecisions: 0,
        U_untriaged: 5,
        B_blocked: 2
      }
    };

    const result = computeBick({ signals, config: mockConfig });

    expect(result.nextBestActions.length).toBeGreaterThan(0);
    expect(result.nextBestActions).toContain('Groom intake: triage unassigned/unlabeled issues.');
    expect(result.nextBestActions).toContain('Kill blockers: resolve dependencies / clarify acceptance criteria.');
  });

  it('should suggest increasing defensibility when DS is low', () => {
    const lowDsConfig = {
      ...mockConfig,
      defensibility_snapshot: {
        dataExclusivity: 0,
        workflowLockIn: 1,
        autonomousExecution: 0,
        switchingCost: 1
      }
    };

    const signals = {
      workItems: [
        {
          id: 'test-1',
          priority: 'P1' as const,
          t2vDays: 3,
          ec: 0.6,
          valueUnits: 100,
          status: 'done' as const
        }
      ],
      cognitive: {
        K_openDecisions: 0,
        U_untriaged: 0,
        B_blocked: 0
      }
    };

    const result = computeBick({ signals, config: lowDsConfig });

    expect(result.components.defensibility_scalar).toBeLessThan(0.5);
    expect(result.nextBestActions).toContain('Increase defensibility: add automation gates + traceability (ADR/RFC links).');
  });

  it('should compute correct defensibility scalar', () => {
    const signals = {
      workItems: [],
      cognitive: {
        K_openDecisions: 0,
        U_untriaged: 0,
        B_blocked: 0
      }
    };

    const result = computeBick({ signals, config: mockConfig });

    // DS = (2 + 3 + 3 + 2) / 16 = 10 / 16 = 0.625
    expect(result.components.defensibility_scalar).toBe(0.625);
  });
});
