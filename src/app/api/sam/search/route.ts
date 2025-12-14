import { NextRequest, NextResponse } from "next/server";
import { apiSuccess, apiError } from "@/lib/apiResponse";
import { logger } from "@/lib/logger";
import { searchSamOpportunities } from "@/lib/sam/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") || undefined;
  const naics = url.searchParams.get("naics") || undefined;
  const psc = url.searchParams.get("psc") || undefined;
  const type = url.searchParams.get("type") || undefined;
  const setAsideCode = url.searchParams.get("setAsideCode") || undefined;
  const agencyCode = url.searchParams.get("agencyCode") || undefined;
  const postedFrom = url.searchParams.get("postedFrom") || undefined;
  const postedTo = url.searchParams.get("postedTo") || undefined;
  const limit = url.searchParams.get("limit");
  const start = url.searchParams.get("start");

  try {
    const response = await searchSamOpportunities({
      q,
      naics,
      psc,
      type,
      setAsideCode,
      agencyCode,
      postedFrom,
      postedTo,
      limit: limit ? Number(limit) : undefined,
      start: start ? Number(start) : undefined,
    });

    logger.info("SAM search API succeeded", {
      q,
      naics,
      psc,
      type,
      setAsideCode,
      agencyCode,
      postedFrom,
      postedTo,
      limit,
      start,
      total: response.totalRecords,
    });

    return NextResponse.json(apiSuccess(response), { status: 200 });
  } catch (error: any) {
    logger.error("SAM search API failed", {
      error: error?.message || String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(apiError(error as Error), { status: 500 });
  }
}
