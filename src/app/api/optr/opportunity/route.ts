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
      status: "Ready for Realization",
      readinessScore: 78
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

    const readinessScore = score({
      title: record.title,
      agency: record.agency,
      responseDate: record.responseDate
    });

    return NextResponse.json({
      id: record.noticeId || id,
      title: record.title || "Untitled Opportunity",
      agency: record.agency || "Unknown Agency",
      responseDate: record.responseDate || "TBD",
      status: record.status || statusFromScore(readinessScore),
      readinessScore
    });
  } catch (err) {
    console.error("SAM.gov detail fallback:", err);
    return NextResponse.json({
      id,
      title: "Advanced Battle Management Support",
      agency: "Department of the Air Force",
      responseDate: "2026-01-14",
      status: "Ready for Realization",
      readinessScore: 78
    });
  }
}

type SamRecord = { title?: string; agency?: string; responseDate?: string };

function score(rec: SamRecord): number {
  let s = 50;
  const title = (rec.title || "").toLowerCase();
  const agency = (rec.agency || "").toLowerCase();

  if (title.includes("ai") || title.includes("ml")) s += 10;
  if (title.includes("cyber") || title.includes("security")) s += 8;
  if (title.includes("cloud")) s += 5;
  if (title.includes("maintenance") || title.includes("logistics")) s += 5;
  if (agency.includes("air force")) s += 4;
  if (agency.includes("army") || agency.includes("peo")) s += 3;

  const days = daysUntil(rec.responseDate);
  if (days !== null) {
    if (days <= 7) s += 8;
    else if (days <= 14) s += 6;
    else if (days <= 30) s += 3;
  }

  return Math.max(30, Math.min(97, s));
}

function statusFromScore(score: number): string {
  if (score >= 80) return "READY";
  if (score >= 65) return "EVALUATE";
  return "REVIEW";
}

function daysUntil(dateStr?: string): number | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const diff = d.getTime() - Date.now();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
