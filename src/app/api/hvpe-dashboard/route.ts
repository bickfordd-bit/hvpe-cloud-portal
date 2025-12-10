import { NextResponse } from "next/server";
import { defaultDashboardData } from "@/lib/hvpeDashboardData";

export async function GET() {
  // placeholder for future live integrations (Alpaca, packets, arbitrator, etc.)
  return NextResponse.json(defaultDashboardData);
}
