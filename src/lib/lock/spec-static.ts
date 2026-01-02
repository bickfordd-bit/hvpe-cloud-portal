/**
 * Static LOCK_SPEC embedded for middleware/edge runtime.
 * This is a code-generated copy - do not edit manually.
 * Generated: December 18, 2025
 *
 * Use this in middleware and edge runtime contexts.
 * For Node.js (API routes, server components), use loadLockSpec() from spec.ts
 */

export const STATIC_LOCK_SPEC = {
  lock_spec_version: "1.1.0",
  locked_at: "2025-12-18T00:00:00-05:00",
  mode: "JAKE_BUILD",

  identity: {
    tenants: {
      jake: { role: "JAKE", route: "/t/jake", mode: "JAKE_BUILD", never_fail: true },
      billy: { role: "BILLY", route: "/t/billy", mode: "BILLY_INVEST", never_fail: false }
    }
  },

  licenses: {
    never_fail_keys: ["BICK-JAKE-LIFETIME-0001"],
    rules: { approval_required: false, status_required: "ACTIVE", route_resolution: "ROLE_BASED" }
  }
};

export function getJakeRoute(): string {
  return STATIC_LOCK_SPEC.identity.tenants.jake.route;
}

export function getBillyRoute(): string {
  return STATIC_LOCK_SPEC.identity.tenants.billy.route;
}

export function isNeverFailTenant(tenantName: string): boolean {
  const tenant = STATIC_LOCK_SPEC.identity.tenants[tenantName as keyof typeof STATIC_LOCK_SPEC.identity.tenants];
  return tenant?.never_fail ?? false;
}
