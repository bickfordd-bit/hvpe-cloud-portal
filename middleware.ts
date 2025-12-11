import { NextRequest, NextResponse } from "next/server";

// TODO: replace with your real session cookie name
const SESSION_COOKIE_NAME = "hvpe_session";

function isLoggedIn(req: NextRequest): boolean {
  const cookie = req.cookies.get(SESSION_COOKIE_NAME);
  return Boolean(cookie?.value);
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const protectedPrefixes = ["/dashboard", "/admin", "/account", "/licenses"];
  const needsAuth = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );

  if (!needsAuth) {
    return NextResponse.next();
  }

  if (isLoggedIn(req)) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", req.url);
  loginUrl.searchParams.set("redirectTo", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/account/:path*", "/licenses/:path*"]
};
