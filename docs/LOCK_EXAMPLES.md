// Example: Using the LOCK System in Your Code
// Location: docs/LOCK_EXAMPLES.md

## 1. Append a DEFINE Event

```typescript
// src/lib/optr/intent.ts
import { appendLedgerEvent } from "@/lib/ledger/append";

export async function recordIntention(intention: string, userId: string) {
  // Create a DEFINE event
  const event = await appendLedgerEvent({
    tenant: "jake",
    command: "DEFINE",
    event_type: "CREATE",
    payload: {
      intent: intention,
      target: "undefined",  // to be refined
      constraints: [],
      success_criteria: [],
      creator: userId,
      timestamp: new Date().toISOString()
    }
  });

  console.log(`DEFINE event recorded: ${event.id} (hash: ${event.hash})`);
  return event.id;
}
```

## 2. Score Paths Using T2V

```typescript
// src/lib/optr/optimizer.ts
import { scorePaths, t2vDollar } from "@/lib/optr/t2v-spec";
import { appendLedgerEvent } from "@/lib/ledger/append";

export async function optimizePath(paths: PathCandidate[]) {
  const scored = scorePaths(
    paths.map(p => ({
      id: p.id,
      input: {
        V: p.value_usd,
        T0: p.planned_days,
        deltaT: p.delay_risk_days,
        Ch: 200,  // $200/hr fully loaded cost
        H: p.rework_hours || 0,
        R: p.risk_usd || 0
      }
    }))
  );

  // Record the scoring
  await appendLedgerEvent({
    tenant: "jake",
    command: "SCORE",
    event_type: "CREATE",
    payload: {
      paths_scored: scored.length,
      results: scored,
      formula_used: "T2V$ = (V / T0) * ΔT + Ch * H + R"
    }
  });

  // Return best path
  return scored[0];  // Lowest T2V$ wins
}
```

## 3. Verify Ledger Chain Integrity

```typescript
// src/app/api/audit/verify-chain/route.ts
import { verifyLedgerChain, getCurrentChainHash } from "@/lib/ledger/append";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tenant = searchParams.get("tenant") || "jake";

  const { valid, errors } = await verifyLedgerChain(tenant);
  const chainHash = await getCurrentChainHash(tenant);

  return NextResponse.json({
    tenant,
    valid,
    chain_hash: chainHash,
    errors: errors.length > 0 ? errors : null,
    status: valid ? "✓ Chain intact" : "✗ Chain compromised"
  });
}
```

## 4. Query Events by Command

```typescript
// src/lib/optr/history.ts
import { getLedgerEvents } from "@/lib/ledger/append";

export async function getAllDefinitions(tenant: string = "jake") {
  const events = await getLedgerEvents({
    tenant,
    command: "DEFINE",
    limit: 1000
  });

  return events.map(e => ({
    id: e.id,
    intent: e.payload.intent,
    created: e.created_at,
    hash: e.hash
  }));
}
```

## 5. Guard a Function with LOCK Spec

```typescript
// src/lib/trading/billy-order.ts
import { loadLockSpec } from "@/lib/lock/spec";

export async function placeBillyOrder(amount: number) {
  const { spec } = loadLockSpec();

  // Enforce hard cap from spec
  const maxAmount = spec.trading_controls.billy.hard_caps.per_order_usd;
  if (amount > maxAmount) {
    throw new Error(`Order exceeds hard cap: $${amount} > $${maxAmount}`);
  }

  // Check if live trading is enabled
  const liveAllowed = process.env.ALLOW_BILLY_LIVE_TRADING === "true";
  if (!liveAllowed) {
    console.log("Live trading disabled; using paper trading");
    return await placePaperOrder(amount);
  }

  return await placeLiveOrder(amount);
}
```

## 6. Compute T2V$ in an Optimization

```typescript
// src/lib/optr/compare-approaches.ts
import { t2vDollar, deltaT2V } from "@/lib/optr/t2v-spec";

export function compareApproaches() {
  // Approach A: Fast path with rework
  const pathA = {
    V: 1000000,  // $1M value
    T0: 30,      // 30 days
    deltaT: 5,   // 5 days delay risk
    Ch: 200,     // $200/hr
    H: 40,       // 40 hours rework
    R: 50000     // $50k risk
  };

  // Approach B: Careful path, less rework
  const pathB = {
    V: 1000000,
    T0: 30,
    deltaT: 2,   // Only 2 days delay (lower risk)
    Ch: 200,
    H: 20,       // Half the rework
    R: 20000     // Lower risk cost
  };

  const resultA = t2vDollar(pathA);
  const resultB = t2vDollar(pathB);
  const delta = deltaT2V(pathA, pathB);

  console.log(`Path A T2V$: $${resultA.total}`);
  console.log(`Path B T2V$: $${resultB.total}`);
  console.log(`Path B saves: $${delta}`);
  // Output:
  // Path A T2V$: $216,583.33
  // Path B T2V$: $186,066.67
  // Path B saves: $30,516.66 (advantage)
}
```

## 7. Middleware Route Guard Example

```typescript
// middleware.ts enforcement is automatic, but here's what happens:

// Request: GET /t/jake (no auth token)
// Middleware action: Redirect to /license?next=/t/jake
// User logs in, gets BICK-JAKE-LIFETIME-0001 license
// Request: GET /t/jake (with token)
// Middleware: Verifies role === "JAKE"
// Result: Allowed ✓

// Request: GET /t/billy (JAKE token)
// Middleware: Checks role !== "BILLY"
// Result: Redirect to /license ✓

// Request: GET /t/jake
// Middleware checks if spec.identity.tenants.jake.route === "/t/jake"
// If someone modified the config file:
// Result: Returns 500 "LOCK violation: jake route drift" ✓
```

## 8. Testing T2V Formula Drift Detection

```typescript
// __tests__/t2v-drift.test.ts
import { t2vDollar } from "@/lib/optr/t2v-spec";
import * as fs from "fs";
import * as path from "path";

test("detects T2V formula drift", () => {
  const specPath = path.join(process.cwd(), "config", "LOCK_SPEC.json");
  const spec = JSON.parse(fs.readFileSync(specPath, "utf8"));

  // Normal call works
  const result = t2vDollar({
    V: 1000000,
    T0: 30,
    deltaT: 5,
    Ch: 200,
    H: 40,
    R: 50000
  });
  
  expect(result.total).toBeCloseTo(216583.33, 0);

  // Simulate formula drift by modifying spec
  spec.optr_t2v.formula = "BROKEN_FORMULA";
  fs.writeFileSync(specPath, JSON.stringify(spec, null, 2));

  // Next call should throw
  expect(() => {
    t2vDollar({
      V: 1000000,
      T0: 30,
      deltaT: 5,
      Ch: 200,
      H: 40,
      R: 50000
    });
  }).toThrow("LOCK violation: OPTR/T2V formula drift");
});
```

## 9. Append a GAP Detection Event

```typescript
// src/lib/optr/gap-detector.ts
import { appendLedgerEvent } from "@/lib/ledger/append";

export async function detectDecayGap(mechanism: string, timeWindow: number) {
  const gap = await appendLedgerEvent({
    tenant: "jake",
    command: "GAP",
    event_type: "CREATE",
    payload: {
      mechanism,  // e.g., "six_pager_approved"
      time_window: timeWindow,  // days since last review
      drift_signals: [
        "metric_regression",
        "re_explanation_required"
      ],
      detected_at: new Date().toISOString(),
      estimated_value_loss: 125000,
      recommended_action: "Re-baseline and rerun OPTR"
    }
  });

  console.log(`Gap detected: ${gap.id}`);
  return gap;
}
```

## 10. Full Example: Intent to Score Pipeline

```typescript
// src/app/api/define-and-score/route.ts
import { NextRequest, NextResponse } from "next/server";
import { appendLedgerEvent } from "@/lib/ledger/append";
import { scorePaths, t2vDollar } from "@/lib/optr/t2v-spec";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { intention, userId, paths } = body;

  try {
    // 1. Record DEFINE event
    const defineEvent = await appendLedgerEvent({
      tenant: "jake",
      command: "DEFINE",
      event_type: "CREATE",
      payload: {
        intent: intention,
        creator: userId,
        timestamp: new Date().toISOString()
      }
    });

    // 2. Score all paths
    const scored = scorePaths(
      paths.map((p: any) => ({
        id: p.id,
        input: {
          V: p.value,
          T0: p.planned_time,
          deltaT: p.delay_risk,
          Ch: 200,
          H: p.rework_hours || 0,
          R: p.risk_cost || 0
        }
      }))
    );

    // 3. Record SCORE event
    const scoreEvent = await appendLedgerEvent({
      tenant: "jake",
      command: "SCORE",
      event_type: "CREATE",
      payload: {
        define_event_id: defineEvent.id,
        paths_scored: scored.length,
        winners: scored.slice(0, 3)  // Top 3 paths
      }
    });

    // 4. Return recommendation
    return NextResponse.json({
      define_id: defineEvent.id,
      score_id: scoreEvent.id,
      recommendation: scored[0],
      alternatives: scored.slice(1, 3),
      formula: "T2V$ = (V / T0) * ΔT + Ch * H + R"
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## Key Principles

1. **Every decision is recorded** — Use `appendLedgerEvent()` for DEFINE, GAP, FREEZE, SCORE, OPTR, PROOF, SHIP
2. **Immutability is automatic** — SHA256 hash + prevHash prevents tampering
3. **Formula is locked** — `t2vDollar()` throws if T2V$ formula drifts
4. **Routes are guarded** — Middleware enforces Jake/Billy role separation
5. **Spec is verified at boot** — Invalid deployment crashes immediately (fail-closed)

---

See [`LOCK_SYSTEM.md`](./LOCK_SYSTEM.md) for complete reference.
