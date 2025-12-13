import { NextRequest, NextResponse } from "next/server";
import type { RunResult, Requirement } from "@/lib/optr/types";
import { getOpportunity } from "../../store";
import { runOptr } from "@/lib/optr/processor";

export async function POST(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").slice(-2, -1)[0] || "";
  const oppty = getOpportunity(id);
  if (!oppty) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
  // Route may accept optional requirements in the request body to be used
  // during scoring. Otherwise processor will use defaults.
  let body: { requirements?: Requirement[] } | null = null;
  try {
    body = await req.json().catch(() => null);
  } catch {
    body = null;
  }

  try {
    const result = await runOptr(oppty, body?.requirements);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ message: err?.message || "Processing error" }, { status: 500 });
  }
}
