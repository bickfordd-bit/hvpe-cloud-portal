import { NextRequest, NextResponse } from "next/server";

const SESSION_COOKIE_NAME = "optr";

const VALID_PASSCODE = process.env.OPTR_PASSCODE || "billionaire";
const ADMIN_EMAIL = process.env.OPTR_ADMIN_EMAIL || "bickfordd@gmail.com";

export async function POST(req: NextRequest) {
  const { email, passcode } = await req.json();

  if (!email || !passcode) {
    return NextResponse.json({ message: "Missing email or passcode" }, { status: 400 });
  }

  if (passcode !== VALID_PASSCODE) {
    return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
  }

  const isAdmin = email.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const sessionPayload = {
    email,
    role: isAdmin ? "admin" : "user"
  };

  const res = NextResponse.json({
    ok: true,
    role: sessionPayload.role,
    redirectTo: "/dashboard"
  });

  res.cookies.set(SESSION_COOKIE_NAME, JSON.stringify(sessionPayload), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return res;
}
