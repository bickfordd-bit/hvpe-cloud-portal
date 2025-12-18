import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json({ valid: false, error: "Missing key" }, { status: 400 });
    }

    const license = await prisma.license.findUnique({ where: { key } });

    if (!license || license.status !== "ACTIVE") {
      return NextResponse.json({ valid: false }, { status: 401 });
    }

    return NextResponse.json({
      valid: true,
      key: license.key,
      role: license.role,
      mode: license.mode,
      tenant: license.tenant,
      tier: license.tier,
      readOnly: license.readOnly,
    });
  } catch (e: any) {
    return NextResponse.json({ valid: false, error: "Server error" }, { status: 500 });
  }
}
