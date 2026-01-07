import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/tenant";

export async function GET() {
  try {
    // 1. Get tenant from request (throws if missing)
    const tenantId = getTenantIdFromRequest();

    // 2. Fetch recent ledger entries
    const rows = await prisma.ledgerEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { id: true, createdAt: true, data: true },
    });

    // 3. Filter to tenant-owned entries only
    const scoped = rows.filter((r) => {
      const envelope = r.data as any;
      return envelope?.tenantId === tenantId;
    });

    return NextResponse.json({
      tenantId,
      entries: scoped,
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
