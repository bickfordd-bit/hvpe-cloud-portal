import { NextResponse } from "next/server";
import { loadLockSpec } from "@/lib/lock/spec";
import { validateLockSpec } from "@/lib/lock/validate";

export async function GET() {
  try {
    const { spec, hash } = loadLockSpec();
    validateLockSpec(spec);

    return NextResponse.json({
      ok: true,
      lock_spec_version: spec.lock_spec_version,
      locked_at: spec.locked_at,
      mode: spec.mode,
      spec_hash_sha256: hash,
      axioms: spec.axioms,
      tenants: spec.identity.tenants,
      never_fail_keys_count: spec.licenses.never_fail_keys.length,
      lifetime_keys_count: spec.licenses.lifetime_keys.length,
      defines: {
        namespace: spec.defines.namespace,
        version: spec.defines.version,
        command_ids: spec.defines.commands.map((c) => c.id),
        command_count: spec.defines.commands.length,
      },
      optr_t2v_formula: spec.optr_t2v?.formula,
      trading_controls: {
        billy_paper_default: spec.trading_controls?.billy?.paper_default,
        billy_hard_cap_usd: spec.trading_controls?.billy?.hard_caps?.per_order_usd,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message,
        type: "LOCK_SPEC_ERROR",
      },
      { status: 500 }
    );
  }
}
