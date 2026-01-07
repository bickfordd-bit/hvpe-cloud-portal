import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantIdFromRequest } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { executionId: string } },
) {
  try {
    // 1. Get tenant from request (throws if missing)
    const tenantId = await getTenantIdFromRequest();
    const executionId = params.executionId;

    // 2. Find execution in ledger
    const rows = await prisma.ledgerEntry.findMany({
      orderBy: { createdAt: "desc" },
      take: 200,
      select: { data: true },
    });

    const match = rows.find((r) => {
      const envelope = r.data as any;
      return envelope?.executionId === executionId;
    });

    if (!match) {
      return new Response("Execution not found", { status: 404 });
    }

    // 3. SECURITY GATE: Verify tenant match
    const envelope = match.data as any;
    if (envelope?.tenantId !== tenantId) {
      return new Response("Forbidden: Cross-tenant access denied", {
        status: 403,
      });
    }

    // 4. Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // Send initial rehydration event
        controller.enqueue(
          encoder.encode(
            `event: execution.rehydrate\ndata: ${JSON.stringify({
              executionId,
              tenantId,
              currentState: envelope?.currentState || "unknown",
            })}\n\n`,
          ),
        );

        // In production, subscribe to live events here
        // For now, close after rehydration
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    // Handle missing tenant context
    if (error.message?.includes("Missing tenant context")) {
      return new Response(error.message, { status: 400 });
    }
    return new Response("Internal server error", { status: 500 });
  }
}
