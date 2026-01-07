import { headers, cookies } from "next/headers";

/**
 * Canonical tenant resolver for ALL server routes.
 *
 * Order of precedence:
 *  1) x-bickford-tenant header (API + internal calls)
 *  2) bickford_tenant cookie (UI routing)
 *
 * Query params are intentionally NOT allowed.
 */
export function getTenantIdFromRequest(): string {
  const h = headers();
  const c = cookies();

  const headerTenant = h.get("x-bickford-tenant");
  if (headerTenant?.trim()) return headerTenant.trim();

  const cookieTenant = c.get("bickford_tenant")?.value;
  if (cookieTenant?.trim()) return cookieTenant.trim();

  throw new Error(
    "Missing tenant context (x-bickford-tenant header or bickford_tenant cookie required)",
  );
}
