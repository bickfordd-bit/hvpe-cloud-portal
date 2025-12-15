type Signals = {
  workItems: Array<{
    id: string;
    priority: "P0" | "P1" | "P2" | "UNKNOWN";
    t2vDays: number;         // proxy
    ec: number;              // 0..1
    valueUnits: number;      // units
    status: "open" | "done" | "blocked" | "unknown";
  }>;
  cognitive: {
    K_openDecisions: number;
    U_untriaged: number;
    B_blocked: number;
  };
};

type Config = {
  weights: {
    alpha_value: number;
    beta_ec: number;
    gamma_t2v: number;
    lambda_cognitive_load: number;
    ds_power: number;
  };
  defensibility_snapshot: {
    dataExclusivity: number;     // 0..4
    workflowLockIn: number;      // 0..4
    autonomousExecution: number; // 0..4
    switchingCost: number;       // 0..4
  };
  value_model: {
    default_value_per_item: number;
    priority_multiplier: Record<string, number>;
  };
};

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

function defensibilityScalar(ds: Config["defensibility_snapshot"]) {
  // Normalize each 0..4 -> 0..1 then average
  const avg =
    (ds.dataExclusivity + ds.workflowLockIn + ds.autonomousExecution + ds.switchingCost) / 16;
  return avg; // 0..1
}

function cognitiveLoad(cog: Signals["cognitive"]) {
  // Simple linear load: C = αK + βU + γB
  const alpha = 1.0, beta = 1.0, gamma = 1.0;
  return alpha * cog.K_openDecisions + beta * cog.U_untriaged + gamma * cog.B_blocked;
}

export function computeBick({ signals, config }: { signals: Signals; config: Config }) {
  const ds = defensibilityScalar(config.defensibility_snapshot);
  const C = cognitiveLoad(signals.cognitive);

  const done = signals.workItems.filter(w => w.status === "done");
  const eps = 1e-9;

  const numerator = done.reduce((sum, w) => sum + (w.valueUnits * clamp01(w.ec)), 0);
  const denom = done.reduce((sum, w) => sum + Math.max(w.t2vDays, 0.01), 0);

  const base = numerator / (denom + eps);
  const bick = base * Math.pow(ds, config.weights.ds_power) * (1 / Math.max(C, 1));

  // "Smarter" loop: identify bottlenecks and propose next-best-actions
  const nextBestActions: string[] = [];
  if (signals.cognitive.U_untriaged > 0) nextBestActions.push("Groom intake: triage unassigned/unlabeled issues.");
  if (signals.cognitive.B_blocked > 0) nextBestActions.push("Kill blockers: resolve dependencies / clarify acceptance criteria.");
  if (ds < 0.5) nextBestActions.push("Increase defensibility: add automation gates + traceability (ADR/RFC links).");

  return {
    BICK_planner: bick,
    components: {
      numerator_value_x_ec: numerator,
      denominator_t2v_days: denom,
      defensibility_scalar: ds,
      cognitive_load_C: C,
      base_value_rate: base
    },
    counts: {
      done: done.length,
      total: signals.workItems.length
    },
    nextBestActions
  };
}
