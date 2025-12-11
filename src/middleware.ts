import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = process.env.ADMIN_DASH_TOKEN;
  if (!token) {
    return new NextResponse("Admin token not configured", { status: 500 });
  }

  const authHeader = request.headers.get("authorization");
  const bearerMatch = authHeader?.match(/^Bearer\s+(.*)$/i);
  const headerToken = bearerMatch?.[1];
  const queryToken = searchParams.get("token");
  const provided = headerToken || queryToken;

  if (provided && provided === token) {
    return NextResponse.next();
  }

  return new NextResponse("Unauthorized", {
    status: 401,
    headers: { "WWW-Authenticate": "Bearer" }
  });
}

export const config = {
  matcher: ["/admin/:path*"]
};
