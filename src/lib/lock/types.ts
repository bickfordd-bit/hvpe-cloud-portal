export type LockSpec = {
  lock_spec_version: string;
  locked_at: string;
  mode: string;
  axioms: Record<string, boolean>;
  identity: {
    branding: { bickford_lowercase: boolean; bick_prefix: string; disallow_bic: boolean };
    tenants: Record<string, { role: string; route: string; mode: string; never_fail: boolean }>;
  };
  licenses: {
    never_fail_keys: string[];
    lifetime_keys: string[];
    rules: { approval_required: boolean; status_required: string; route_resolution: string };
  };
  defines: {
    namespace: string;
    version: string;
    commands: Array<{
      id: string;
      purpose: string;
      required_fields: string[];
      outputs: string[];
    }>;
    invariants: string[];
  };
  activation: unknown;
  optr_t2v: unknown;
  pilot_success: unknown;
  aws_gap_model: unknown;
  security: unknown;
  trading_controls: unknown;
  ui_invariants: unknown;
  storage_rules: unknown;
  operations: unknown;
};
