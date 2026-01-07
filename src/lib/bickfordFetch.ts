/**
 * Wrapper around fetch that automatically propagates tenant context.
 * All UI → API calls should use this instead of raw fetch.
 */
export async function bickfordFetch(
  input: RequestInfo,
  init: RequestInit & { tenantId: string },
): Promise<Response> {
  const { tenantId, ...rest } = init;

  const headers = new Headers(rest.headers || {});
  headers.set("x-bickford-tenant", tenantId);

  return fetch(input, { ...rest, headers });
}
