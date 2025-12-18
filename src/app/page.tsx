import { redirect } from "next/navigation";
import { getSession } from "@/lib/licenseSession.crypto";

/**
 * Root page: Entry point for all users.
 * 
 * Canonical rule: No user ever sees a dashboard until their role + mode is resolved.
 * 
 * This page enforces the funnel:
 * 1. Check session
 * 2. If no session → redirect to /license
 * 3. If session → redirect by role (/t/jake or /t/billy)
 * 4. Otherwise → back to /license (safety fallback)
 */
export default async function Home() {
  const session = await getSession();

  // No session: go to license page
  if (!session) {
    redirect("/license");
  }

  // Route by role
  if (session.role === "JAKE") {
    redirect("/t/jake");
  }
  if (session.role === "BILLY") {
    redirect("/t/billy");
  }

  // Unknown role: back to license (safety)
  redirect("/license");
}
