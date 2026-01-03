import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signClaims } from '@/lib/licenseSession.crypto';
import { LICENSE_COOKIE, type LicenseClaims } from '@/lib/licenseSession.types';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ ok: false, error: 'Missing key' }, { status: 400 });
    }

    const license = await prisma.license.findUnique({ where: { key } });
    if (!license || license.status !== 'ACTIVE') {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const claims: LicenseClaims = {
      key: license.key,
      role: license.role || '',
      mode: license.mode || '',
      tenant: license.tenant || '',
      readOnly: license.readOnly,
      // 30 days session (adjust as you want; Jake lifetime key doesn't mean cookie never expires)
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
    };

    const token = signClaims(claims);

    const res = NextResponse.json({ ok: true, role: license.role });
    res.cookies.set({
      name: LICENSE_COOKIE,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return res;
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
