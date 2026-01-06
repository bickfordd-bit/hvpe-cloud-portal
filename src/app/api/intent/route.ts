/**
 * Intent API Route
 * POST /api/intent - Process user intents through the filing system
 */

import { NextRequest, NextResponse } from "next/server";
import { handleIntent } from "@/lib/runtime/handleIntent";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const result = await handleIntent(payload);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Intent processing failed:", error);
    return NextResponse.json(
      { error: "Intent processing failed" },
      { status: 500 },
    );
  }
}
