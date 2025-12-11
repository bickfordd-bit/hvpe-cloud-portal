import { NextRequest, NextResponse } from "next/server";
import type { OPTRState } from "@/lib/optr/types";
import { getOpportunity } from "../../store";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").slice(-2, -1)[0] || "";
  const oppty = getOpportunity(id);
  if (!oppty) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const state: OPTRState = {
    phase: "D",
    blocked: false,
    blockers: [],
    coverage: 0.62,
    win_prob: 0.28,
    ecv: 1750000
  };

  return NextResponse.json(state);
}
