import { cookies } from "next/headers";
import { ReactNode } from "react";

export default async function TenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { tenant: string };
}) {
  // Persist tenant for server routes
  const cookieStore = await cookies();
  cookieStore.set("bickford_tenant", params.tenant, {
    httpOnly: false, // Allow client-side JS to read (for bickfordFetch)
    path: "/",
    sameSite: "lax",
  });

  return <>{children}</>;
}
