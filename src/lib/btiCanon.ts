export type CanonIdentity = {
  systemId: string;
  companyName: string;
  mode: "EXECUTION_FIRST";
  policy: string;
};

export type MetricFormula = {
  name: string;
  expression: string;
  description: string;
};

export type ProofArtifact = {
  label: string;
  context: string;
  class: string;
  status: "locked" | "pending";
};

export type SalePhase = {
  id: string;
  title: string;
  objective: string;
  requirements: string[];
  outputs: string[];
  gate: string;
};

export type CanonDefinition = {
  identity: CanonIdentity;
  objectives: {
    global: string;
    targetBuyer: string;
  };
  metrics: {
    formulas: MetricFormula[];
    currentBickValue: number;
  };
  proofLaw: string;
  proofs: ProofArtifact[];
  saleArchitecture: SalePhase[];
  architecturePrinciples: string[];
};

export const BICKFORD_CANON: CanonDefinition = {
  identity: {
    systemId: "BICKFORD",
    companyName: "Bickford Technologies, Inc.",
    mode: "EXECUTION_FIRST",
    policy: "NO_PROOF ⇒ NO_EXISTENCE",
  },
  objectives: {
    global:
      "Maximize realizable sale value while keeping the derivative of BICK_$ positive.",
    targetBuyer: "Microsoft Copilot team (Asset 360) as primary wedge.",
  },
  metrics: {
    formulas: [
      {
        name: "T2V",
        expression: "t(proof) − t(intent)",
        description: "Time to convert an intent into a proven outcome.",
      },
      {
        name: "ΔT2V",
        expression: "T2V_baseline − T2V_actual",
        description: "Improvement over buyer baseline.",
      },
      {
        name: "BICK_$",
        expression:
          "(ΔT2V / T2V_baseline) × C_exe × Q_proof × D × R × M",
        description:
          "Core value score that tracks proof-gated economic output.",
      },
      {
        name: "Confidence_1B",
        expression: "≈ BICK_$",
        description: "Tracks confidence of hitting $1B outcome.",
      },
    ],
    currentBickValue: 0.56,
  },
  proofLaw:
    "If proof does not exist (artifact + timestamp + delta), the value of the work is zero.",
  proofs: [
    {
      label: "Proof A",
      context: "Fishtown Beverage",
      class: "Proof_of_Mechanism",
      status: "locked",
    },
    {
      label: "Proof B",
      context: "Derek @ PTC",
      class: "Proof_of_Economic_Reality",
      status: "locked",
    },
  ],
  architecturePrinciples: [
    "Multi-tenant execution platform with strict tenant isolation enforced at compute, key, and data layers.",
    "Proof-gated monetization: verification success is a prerequisite for any billing event.",
    "Event-driven backbone using EventBridge + SQS queues for asynchronous orchestration and retries.",
    "Immutable audit trail via WORM-capable storage (Dynamo ledger + S3 Object Lock) for compliance alignment.",
    "Compounding learning loop (CIC) where only verified outcomes can train or tune the system.",
    "Implementation ships as production-ready scaffolding that deploys to AWS with minimal configuration adjustments.",
  ],
  saleArchitecture: [
    {
      id: "phase-0",
      title: "Canon Lock",
      objective: "Restate non negotiables in every buyer artifact.",
      requirements: [
        "Publish canon to repo",
        "Attach Proof Law to NDAs and SOWs",
        "Freeze Outcome UI and repo root",
      ],
      outputs: [
        "Signed acknowledgment of Proof Law",
        "Baseline BICK_$ reference",
      ],
      gate: "Canon artifacts countersigned.",
    },
    {
      id: "phase-1",
      title: "Asset Packaging",
      objective: "Quantify value per SKU with proof bundles.",
      requirements: [
        "Enumerate CORE-IP, BUS-ENT, DEF-EXEC, MOB-DAD",
        "Attach ΔT2V and Risk Removed metrics",
        "Store bundles in Dynamo + S3 Object Lock",
      ],
      outputs: [
        "Billionaire Confidence sheet",
        "Valuation dataset per SKU",
      ],
      gate: "Valuation packet reviewed with counsel.",
    },
    {
      id: "phase-2",
      title: "Buyer Funnel",
      objective:
        "Construct OPTR loops per tier (Microsoft, ServiceNow, Defense, etc.).",
      requirements: [
        "Define wedge per buyer",
        "Map intent intake → pilot scope → proof",
        "Instrument EventBridge ledger",
      ],
      outputs: [
        "Buyer readiness board",
        "Live OPTR routing for pilots",
      ],
      gate: "Buyer-specific pilot scope drafted.",
    },
    {
      id: "phase-3",
      title: "Pilot to Production",
      objective: "Prove SLA compliance and convert to production contract.",
      requirements: [
        "Signed proof-law contracts",
        "Copilot intent stream configured",
        "Verification + billing hooks online",
      ],
      outputs: [
        "VerificationFinalized events ≥ threshold",
        "Production-ready SLA packet",
      ],
      gate: "Two proofed pilot cycles completed.",
    },
    {
      id: "phase-4",
      title: "Monetization Structure",
      objective: "Decide acquisition vs earn-out vs JV path.",
      requirements: [
        "Assemble diligence data room",
        "Model straight sale and structured scenarios",
        "Retain M&A counsel",
      ],
      outputs: [
        "Term sheets reflecting $1B target",
        "Pricing model mapped to SPA",
      ],
      gate: "Preferred structure approved by board.",
    },
    {
      id: "phase-5",
      title: "Negotiation & Close",
      objective: "Execute sale while preserving rollback and CIC learning.",
      requirements: [
        "Treat sale as OPTR packet (intent, paths, rollback)",
        "Use proof bundles as negotiation evidence",
        "Bind Proof Law into SPA/Earn-out clauses",
      ],
      outputs: [
        "Signed SPA/SOW",
        "Payment + earn-out schedule tied to proof hashes",
      ],
      gate: "Funds released and integration plan accepted.",
    },
    {
      id: "phase-6",
      title: "Post Sale Execution",
      objective: "Integrate or operate JV without breaking canon.",
      requirements: [
        "Preserve Object Lock history",
        "Keep CIC compounding authority",
        "Update STATE to reflect new ownership",
      ],
      outputs: [
        "Updated canon with new governance",
        "Runbook for ongoing proof-gated operations",
      ],
      gate: "Integration audit signed by buyer.",
    },
  ],
};
