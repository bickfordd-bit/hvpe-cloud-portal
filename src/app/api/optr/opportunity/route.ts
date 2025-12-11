import { NextRequest, NextResponse } from "next/server";

const SAM_API_KEY = process.env.OPTR_SAM_API_KEY;

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id") || "0";

  if (!SAM_API_KEY) {
    return NextResponse.json({
      id,
      title: "Advanced Battle Management Support",
      agency: "Department of the Air Force",
      responseDate: "2026-01-14",
      status: "Ready for Realization"
    });
  }

  try {
    const url = new URL("https://api.sam.gov/prod/opportunities/v2/search");
    url.searchParams.set("noticeId", id);
    url.searchParams.set("limit", "1");
    url.searchParams.set("api_key", SAM_API_KEY);

    const res = await fetch(url.toString(), { cache: "no-store" });
    if (!res.ok) {
      console.error("SAM.gov detail error:", await res.text());
      throw new Error("SAM detail fetch failed");
    }

    const data = (await res.json()) as { opportunitiesData?: { opportunities?: any[] } };
    const record = data.opportunitiesData?.opportunities?.[0];

    if (!record) {
      throw new Error("No record found");
    }

    return NextResponse.json({
      id: record.noticeId || id,
      title: record.title || "Untitled Opportunity",
      agency: record.agency || "Unknown Agency",
      responseDate: record.responseDate || "TBD",
      status: record.status || "Evaluation"
    });
  } catch (err) {
    console.error("SAM.gov detail fallback:", err);
    return NextResponse.json({
      id,
      title: "Advanced Battle Management Support",
      agency: "Department of the Air Force",
      responseDate: "2026-01-14",
      status: "Ready for Realization"
    });
  }
}
