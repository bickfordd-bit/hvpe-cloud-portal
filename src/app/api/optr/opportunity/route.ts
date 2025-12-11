import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || "0";

  return NextResponse.json({
    id,
    title: "Advanced Battle Management Support",
    agency: "Department of the Air Force",
    responseDate: "2026-01-14",
    status: "Ready for Realization"
  });
}
