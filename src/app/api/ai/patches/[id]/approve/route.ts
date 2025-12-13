import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const secret = process.env.ADMIN_DASH_TOKEN || process.env.ADMIN_APPLY_SECRET;
  if (secret) {
    const h = req.headers.get("x-admin-secret");
    if (h !== secret) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const patch = await prisma.aIPatchLog.findUnique({ where: { id } });
  if (!patch) return NextResponse.json({ error: "not found" }, { status: 404 });

  const updated = await prisma.aIPatchLog.update({ where: { id }, data: { approvedBy: "admin", approvedAt: new Date() } });
  return NextResponse.json({ ok: true, id: updated.id, approvedAt: updated.approvedAt });
}
