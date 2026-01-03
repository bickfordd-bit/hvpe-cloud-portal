/**
 * Copyright (c) 2025 HVPE Inc. All rights reserved.
 * Proprietary - Patent Pending
 *
 * API Key Validation
 */

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { apiKey } = await req.json();

    if (!apiKey || !apiKey.startsWith('bickford_')) {
      return NextResponse.json({ valid: false, error: 'Invalid API key format' }, { status: 401 });
    }

    // In production, check against database hash
    // For now, accept any properly formatted key
    const isValid = apiKey.length > 20;

    if (isValid) {
      return NextResponse.json({
        valid: true,
        scopes: ['bickford:chat', 'optr:run', 'optr:status'],
        message: 'API key is valid',
      });
    } else {
      return NextResponse.json(
        { valid: false, error: 'API key not found or expired' },
        { status: 401 }
      );
    }
  } catch (error: unknown) {
    console.error('[API KEY VALIDATION ERROR]', error);
    return NextResponse.json({ valid: false, error: 'Validation failed' }, { status: 500 });
  }
}
