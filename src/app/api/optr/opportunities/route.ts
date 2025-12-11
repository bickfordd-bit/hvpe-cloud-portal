import { NextRequest, NextResponse } from "next/server";
import type { Opportunity } from "@/lib/optr/types";
import { listOpportunities, upsertOpportunity } from "./store";

export async function GET() {
  return NextResponse.json(listOpportunities());
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as Opportunity | null;
  if (!body || !body.id) {
    return NextResponse.json({ message: "Missing id" }, { status: 400 });
  }

  const saved = upsertOpportunity(body);
  return NextResponse.json(saved);
}
