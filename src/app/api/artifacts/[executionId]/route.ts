import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/licenseSession.crypto";
import { getArtifacts } from "@/lib/artifacts/store";

export async function GET(
  req: NextRequest,
  { params }: { params: { executionId: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const artifacts = await getArtifacts(params.executionId);

  // Filter to tenant's artifacts only
  const tenantArtifacts = artifacts.filter(
    (a) => a.tenant_id === session.tenant
  );

  return NextResponse.json({ artifacts: tenantArtifacts });
}
