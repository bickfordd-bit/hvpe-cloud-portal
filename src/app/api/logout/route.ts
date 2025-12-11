import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "optr";

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0
  });
  return res;
}
