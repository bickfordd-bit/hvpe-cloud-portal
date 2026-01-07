import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/tenant";

export async function GET(
  _req: NextRequest,
  { params }: { params: { ledgerEntryId: string } },
) {
  try {
    // 1. Get tenant from request (throws if missing)
    const tenantId = getTenantIdFromRequest();
    const ledgerEntryId = params.ledgerEntryId;

    // 2. Fetch ledger entry
    const entry = await prisma.ledgerEntry.findUnique({
      where: { id: ledgerEntryId },
      select: { id: true, data: true, createdAt: true },
    });

    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 3. Extract tenant from envelope
    const envelope = entry.data as any;
    const entryTenant = envelope?.tenantId;

    if (!entryTenant) {
      return NextResponse.json(
        { error: "Ledger entry missing tenantId (non-canonical)" },
        { status: 500 },
      );
    }

    // 4. SECURITY GATE: Verify tenant match
    if (entryTenant !== tenantId) {
      return NextResponse.json(
        { error: "Forbidden: Cross-tenant access denied" },
        { status: 403 },
      );
    }

    // 5. Return artifacts
    return NextResponse.json({
      ledgerEntryId: entry.id,
      tenantId,
      artifacts: envelope?.data?.artifacts ?? [],
      createdAt: entry.createdAt,
    });
  } catch (error: any) {
    // Handle missing tenant context
    if (error.message?.includes("Missing tenant context")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
