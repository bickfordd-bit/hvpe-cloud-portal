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
    stage: "scoring",
    progress: 62,
    message: "Analyzing requirements and scoring coverage"
  };

  return NextResponse.json(state);
}
