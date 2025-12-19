import { NextRequest, NextResponse } from "next/server";
import { LICENSE_COOKIE } from "@/lib/licenseSession.types";
import { STATIC_LOCK_SPEC, getJakeRoute, getBillyRoute } from "@/lib/lock/spec-static";

// Bickford runtime check (server-only, no imports in middleware edge runtime)
// We check for bickford.mode.json existence and enforce on specific routes
const BICKFORD_ROUTES = ["/api/bickford", "/t/jake", "/t/billy"];

// Session cookie for auth
const SESSION_COOKIE_NAME = "optr";

// Note: For crypto operations in middleware, we verify the JWT structure without decryption
// The actual verification happens in the API routes which run in Node.js runtime
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- Bickford mode enforcement (if applicable)
  const isBickfordRoute = BICKFORD_ROUTES.some(route => pathname.startsWith(route));
  if (isBickfordRoute) {
    // Check for required Bickford headers on POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      const bickfordTs = req.headers.get('x-bickford-ts');
      const bickfordKind = req.headers.get('x-bickford-kind');
      
      // If mode is active (checked in API routes), these will be validated
      // Middleware just logs for observability
      if (!bickfordTs || !bickfordKind) {
        console.warn(`[Bickford] Request to ${pathname} missing timestamp headers`);
      }
    }
  }

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
