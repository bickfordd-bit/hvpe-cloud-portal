import { NextRequest, NextResponse } from "next/server";
import { LICENSE_COOKIE } from "@/lib/licenseSession.types";
import { STATIC_LOCK_SPEC, getJakeRoute, getBillyRoute } from "@/lib/lock/spec-static";

// Session cookie for auth
const SESSION_COOKIE_NAME = "optr";

// Note: For crypto operations in middleware, we verify the JWT structure without decryption
// The actual verification happens in the API routes which run in Node.js runtime
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- helper: auth redirect
  const denyToLicense = (nextPath: string) => {
    const url = req.nextUrl.clone();
    url.pathname = "/license";
    url.searchParams.set("next", nextPath);
    return NextResponse.redirect(url);
  };

  const token = req.cookies.get(LICENSE_COOKIE)?.value;

  // --- Jake route: never fail, must be guarded by role
  if (pathname.startsWith(getJakeRoute())) {
    // Verify token exists
    if (!token) {
      return denyToLicense(getJakeRoute());
    }

    // TODO: Decode token and verify claims.role === "JAKE"
    // For now, presence of token is sufficient (full validation in API routes)

    // Enforce route invariant from spec
    if (STATIC_LOCK_SPEC.identity.tenants.jake.route !== getJakeRoute()) {
      return NextResponse.json({ error: "LOCK violation: jake route drift" }, { status: 500 });
    }

    return NextResponse.next();
  }

  // --- Billy route: guarded by role, supports paper/live trading
  if (pathname.startsWith(getBillyRoute()) || pathname.startsWith("/api/billy/")) {
    if (!token) {
      return denyToLicense(getBillyRoute());
    }

    // TODO: Decode token and verify claims.role === "BILLY"

    // Enforce route invariant from spec
    if (STATIC_LOCK_SPEC.identity.tenants.billy.route !== getBillyRoute()) {
      return NextResponse.json({ error: "LOCK violation: billy route drift" }, { status: 500 });
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
    "/t/billy/:path*",
    "/api/billy/:path*",
    "/dashboard/:path*",
    "/admin/:path*",
    "/account/:path*",
    "/licenses/:path*",
  ],
};
