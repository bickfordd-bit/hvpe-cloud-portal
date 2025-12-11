import { NextRequest, NextResponse } from "next/server";
import type { RunResult } from "@/lib/optr/types";
import { getOpportunity } from "../../store";

export async function POST(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").slice(-2, -1)[0] || "";
  const oppty = getOpportunity(id);
  if (!oppty) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const result: RunResult = {
    state: {
      phase: "V",
      blocked: false,
      blockers: [],
      coverage: 0.78,
      win_prob: 0.32,
      ecv: 2500000
    },
    requirements: [
      {
        id: "REQ-001",
        section: "C.1",
        text: "Provide AI-enabled threat detection with 24/7 monitoring.",
        kind: "shall",
        priority: 1
      },
      {
        id: "REQ-002",
        section: "C.2",
        text: "Deliver mission dashboards accessible via classified enclaves.",
        kind: "must",
        priority: 2
      }
    ],
    traces: [
      {
        req_id: "REQ-001",
        response_id: "RESP-1",
        evidence_doc_ids: [],
        confidence: 0.78,
        gaps: []
      },
      {
        req_id: "REQ-002",
        response_id: "RESP-2",
        evidence_doc_ids: [],
        confidence: 0.64,
        gaps: ["Need enclave access pattern confirmed."]
      }
    ],
    package: {
      id: `pkg_${id}`,
      url: "https://example.com/optr-package.zip",
      filename: `optr-${id}.zip`
    }
  };

  return NextResponse.json(result);
}
