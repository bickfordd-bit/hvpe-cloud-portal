import { NextRequest, NextResponse } from "next/server";

// Session cookie for auth
const SESSION_COOKIE_NAME = "optr";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedPrefixes = ["/dashboard", "/admin", "/account", "/licenses"];
  const needsAuth = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (!needsAuth) {
    return NextResponse.next();
  }

  const cookie = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (cookie) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirectTo", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/account/:path*", "/licenses/:path*"]
};
