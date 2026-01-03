import { NextResponse } from 'next/server';
import crypto from 'crypto';

import { prisma } from '@/lib/prisma';

const MAX_KEY_ATTEMPTS = 5;

function generateLicenseKey() {
  const seg = () => crypto.randomBytes(3).toString('hex').toUpperCase();
  return `HVPE-${seg()}-${seg()}-${seg()}`;
}

async function createUniqueLicenseKey() {
  for (let i = 0; i < MAX_KEY_ATTEMPTS; i += 1) {
    const key = generateLicenseKey();
    const exists = await prisma.license.findUnique({ where: { key } });
    if (!exists) return key;
  }
  throw new Error('Failed to generate a unique license key');
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body || typeof body.requestId !== 'string') {
      return NextResponse.json({ error: 'requestId is required' }, { status: 400 });
    }

    const { requestId } = body;

    const request = await prisma.licenseRequest.findUnique({
      where: { id: requestId },
      include: { license: true },
    });

    if (!request) {
      return NextResponse.json({ error: 'License request not found' }, { status: 404 });
    }

    if (request.status !== 'PENDING') {
      if (request.license) {
        return NextResponse.json(
          {
            error: 'License request is not pending',
            status: request.status,
            licenseKey: request.license.key,
            email: request.license.email,
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'License request is not pending', status: request.status },
        { status: 400 }
      );
    }

    const licenseKey = await createUniqueLicenseKey();

    const license = await prisma.license.create({
      data: {
        key: licenseKey,
        email: request.email,
        status: 'ACTIVE',
      },
    });

    await prisma.licenseRequest.update({
      where: { id: requestId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        licenseId: license.id,
      },
    });

    // TODO: plug in your email sender here to deliver the key to request.email

    return NextResponse.json({ success: true, licenseKey, email: request.email }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error approving license request:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
