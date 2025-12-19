/**
 * LinkedIn OAuth - Callback handler
 * GET /api/linkedin/callback?code=xxx&state=xxx
 */

import { NextRequest, NextResponse } from 'next/server';
import { linkedInClient } from '@/lib/linkedin/client';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    // Check for OAuth errors
    if (error) {
      logger.error('LinkedIn OAuth error', { error });
      return NextResponse.redirect(
        new URL(`/dashboard?error=linkedin_auth_${error}`, req.url)
      );
    }

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing code or state parameter' },
        { status: 400 }
      );
    }

    // Verify state for CSRF protection
    const savedState = req.cookies.get('linkedin_oauth_state')?.value;
    if (state !== savedState) {
      logger.error('LinkedIn OAuth state mismatch', { state, savedState });
      return NextResponse.json(
        { error: 'Invalid state parameter' },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenData = await linkedInClient.exchangeCodeForToken(code);

    // Store token in session/database (simplified - store in cookie for demo)
    const response = NextResponse.redirect(new URL('/dashboard?linkedin_connected=true', req.url));
    response.cookies.set('linkedin_access_token', tokenData.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokenData.expires_in,
    });

    // Clear state cookie
    response.cookies.delete('linkedin_oauth_state');

    logger.info('LinkedIn OAuth successful', { scope: tokenData.scope });

    return response;
  } catch (error: any) {
    logger.error('LinkedIn callback error', { error: error.message });
    return NextResponse.redirect(
      new URL('/dashboard?error=linkedin_callback_failed', req.url)
    );
  }
}
