import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/licenseSession.crypto';
import { LICENSE_COOKIE } from '@/lib/licenseSession.types';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get(LICENSE_COOKIE)?.value;
    const claims = verifyToken(token);

    if (!claims || claims.role !== 'JAKE') {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      claims: {
        key: claims.key,
        role: claims.role,
        mode: claims.mode,
        tenant: claims.tenant,
        readOnly: claims.readOnly,
      },
    });
  } catch (e: unknown) {
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
