// Node.js only - crypto functions for API routes
import crypto from "crypto";
import type { LicenseClaims } from "./licenseSession.types";
import { LICENSE_COOKIE } from "./licenseSession.types";

const SECRET = process.env.LICENSE_SESSION_SECRET;

if (process.env.NODE_ENV === "production" && !SECRET) {
  console.warn("⚠️ LICENSE_SESSION_SECRET not set in production");
}

function b64url(buf: Buffer) {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlToBuf(s: string) {
  s = s.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

export function signClaims(claims: LicenseClaims): string {
  const payload = b64url(Buffer.from(JSON.stringify(claims), "utf8"));
  const sig = crypto
    .createHmac("sha256", SECRET || "dev-secret-not-for-prod")
    .update(payload)
    .digest();
  return `${payload}.${b64url(sig)}`;
}

export function verifyToken(token?: string | null): LicenseClaims | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;

  const expected = crypto
    .createHmac("sha256", SECRET || "dev-secret-not-for-prod")
    .update(payload)
    .digest();
  const provided = b64urlToBuf(sig);

  if (provided.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(provided, expected)) return null;

  try {
    const claims = JSON.parse(
      Buffer.from(payload, "base64").toString("utf8")
    ) as LicenseClaims;
    if (!claims?.exp || Date.now() / 1000 > claims.exp) return null;
    return claims;
  } catch {
    return null;
  }
}

/**
 * Server component helper: Read and verify session from cookies.
 * 
 * Usage in server components:
 *   import { getSession } from "@/lib/licenseSession.crypto";
 *   const session = await getSession();
 *   if (!session) redirect("/license");
 */
export async function getSession(): Promise<LicenseClaims | null> {
  // Can't use cookies() in edge runtime - only in Node.js server components
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get(LICENSE_COOKIE)?.value;
  return verifyToken(token);
}
