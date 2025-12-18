import { NextRequest, NextResponse } from "next/server";
import { LICENSE_COOKIE } from "@/lib/licenseSession.types";

// Session cookie for auth
const SESSION_COOKIE_NAME = "optr";

// Note: For crypto operations in middleware, we verify the JWT structure without decryption
// The actual verification happens in the API routes which run in Node.js runtime
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect Jake instance - check for presence of license cookie
  // Full validation happens in the client-side verify call
  if (pathname.startsWith("/t/jake")) {
    const token = req.cookies.get(LICENSE_COOKIE)?.value;

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/license";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }

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
  matcher: [
    "/t/jake/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/account/:path*",
    "/licenses/:path*",
  ],
};
