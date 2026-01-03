import type { LockSpec } from './types';

export function validateLockSpec(spec: LockSpec): void {
  const req = (cond: unknown, msg: string) => {
    if (!cond) throw new Error(`LOCK_SPEC_INVALID: ${msg}`);
  };

  req(spec.locked_at, 'missing locked_at');
  req(spec.mode === 'JAKE_BUILD', 'mode must be JAKE_BUILD');
  req(spec.axioms?.PROMPTS_EQUALS_STORAGE === true, 'PROMPTS_EQUALS_STORAGE must be true');
  req(spec.axioms?.SUPPORT_ONLY === true, 'SUPPORT_ONLY must be true');
  req(
    Array.isArray(spec.licenses?.never_fail_keys) && spec.licenses.never_fail_keys.length > 0,
    'never_fail_keys required'
  );
  req(spec.identity?.tenants?.jake?.route === '/t/jake', 'jake route must be /t/jake');

  // Defines must include core command set
  const ids = new Set((spec.defines?.commands || []).map((c) => c.id));
  ['DEFINE', 'GAP', 'FREEZE', 'SIM', 'SCORE', 'OPTR', 'T2V', 'LEDGER', 'PROOF', 'SHIP'].forEach(
    (id) => req(ids.has(id), `defines.commands missing ${id}`)
  );

  // Trading guardrail must exist
  req(
    spec.trading_controls?.billy?.live_guardrail?.require_env_flag === 'ALLOW_BILLY_LIVE_TRADING',
    'billy live_guardrail require_env_flag must be ALLOW_BILLY_LIVE_TRADING'
  );
}
