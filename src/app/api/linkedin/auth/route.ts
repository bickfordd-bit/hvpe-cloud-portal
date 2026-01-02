/**
 * LinkedIn OAuth - Initiate authorization
 * GET /api/linkedin/auth
 */

import { NextRequest, NextResponse } from 'next/server';
import { linkedInClient } from '@/lib/linkedin/client';

export async function GET(req: NextRequest) {
  try {
    const state = crypto.randomUUID();
    const authUrl = linkedInClient.getAuthUrl(state);

    // Store state in cookie for CSRF protection
    const response = NextResponse.redirect(authUrl);
    response.cookies.set('linkedin_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600, // 10 minutes
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to initiate LinkedIn auth', details: error.message },
      { status: 500 }
    );
  }
}
