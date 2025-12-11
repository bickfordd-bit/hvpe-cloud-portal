import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const id = body.id ?? "unknown";

  const pdfUrl = `https://hvpe-cloud-portal.vercel.app/static/optr/submission-${id}.pdf`;

  return NextResponse.json({
    ok: true,
    id,
    pdfUrl
  });
}
